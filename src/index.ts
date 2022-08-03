import { Duration } from 'aws-cdk-lib';
import { Table, BillingMode, AttributeType } from 'aws-cdk-lib/aws-dynamodb';
import { Parallel, StateMachineFragment, JsonPath, Choice, Pass, Wait, WaitTime, Condition, State, IChainable, INextable } from 'aws-cdk-lib/aws-stepfunctions';
import { DynamoAttributeValue, DynamoGetItem, DynamoProjectionExpression, DynamoPutItem, DynamoReturnValues, DynamoUpdateItem } from 'aws-cdk-lib/aws-stepfunctions-tasks';
import { Construct } from 'constructs';

/**
 * Interface for creating a SemaphoreGenerator
 */
export interface SemaphoreGeneratorProps {
  /**
   * Optionally set the DynamoDB table to have a specific read/write capacity with PROVISIONED billing.
   * @default PAY_PER_REQUEST
   */
  readonly tableReadWriteCapacity?: TableReadWriteCapacity;
}

/**
 * Read and write capacity for a PROVISIONED billing DynamoDB table.
 */
export interface TableReadWriteCapacity {
  readonly readCapacity: number;
  readonly writeCapacity: number;
}

interface UsageTracker {
  readonly limit: number;
  readonly timesUsed: number;
}

export interface IChainNextable extends IChainable, INextable { }

/**
 * Sets up up the DynamoDB table that stores the State Machine semaphores.
 * Call `generateSemaphoredJob` to generate semaphored jobs.
 */
export class SemaphoreGenerator extends Construct {

  /**
   * The DynamoDB table used to store semaphores.
   */
  private semaphoreTable: Table;

  /**
   * The names and associated concurrency limits and number of uses of the sempahores.
   */
  private semaphoreTracker: Map<string, UsageTracker>;

  constructor(scope: Construct, id: string, props?: SemaphoreGeneratorProps) {
    super(scope, id);
    this.semaphoreTracker = new Map<string, UsageTracker>();
    this.semaphoreTable = new Table(this, 'StateMachineSempahoreTable', {
      partitionKey: {
        name: 'LockName',
        type: AttributeType.STRING,
      },
      readCapacity: props?.tableReadWriteCapacity?.readCapacity,
      writeCapacity: props?.tableReadWriteCapacity?.writeCapacity,
      billingMode: props?.tableReadWriteCapacity ? BillingMode.PROVISIONED : BillingMode.PAY_PER_REQUEST,
    });

  }
  /**
   * Generates a semaphore for a StepFunction job (or chained set of jobs) to limit parallelism across executions.
   * @param lockName The name of the semaphore.
   * @param limit The maximum number of concurrent executions for the given lock.
   * @param job The job (or chained jobs) to be semaphored.
   * @param nextState The State to go to after the semaphored job completes.
   * @param reuseLock Explicility allow the reuse of a named lock from a previously generated job. Throws an error if a different `limit` is specified. Default: false.
   * @param comments Adds detailed comments to lock related states. Significantly increases CloudFormation template size. Default: false.
   * @returns A StateMachineFragment that can chained to other states in the State Machine.
   */
  public generateSemaphoredJob(
    lockName: string, limit: number, job: IChainNextable, nextState: State, reuseLock?: boolean, comments?: boolean,
  ): StateMachineFragment {
    let lockInfo = this.semaphoreTracker.get(lockName);
    if (lockInfo) {
      if (reuseLock) {
        if (lockInfo.limit != limit) {
          throw new Error(`The reused \`lockName\` "${lockName}" was given a different \`limit\` than previously defined. Given: ${limit}, Previous: ${lockInfo.limit}.`);
        } else {
          lockInfo = { limit: lockInfo.limit, timesUsed: lockInfo.timesUsed + 1 };
          this.semaphoreTracker.set(lockName, lockInfo);
        }
      } else {
        throw new Error(`The \`lockName\` "${lockName}" was reused without explicitly allowing reuse. Set \`reuseLock\` to \`true\` if you want to reuse the lock.`);
      }
    } else {
      lockInfo = { limit: limit, timesUsed: 1 };
      this.semaphoreTracker.set(lockName, lockInfo);
    }

    const getLock = new Parallel(this, `Get ${lockName} Lock: ${lockInfo.timesUsed}`, { resultPath: JsonPath.DISCARD });
    const acquireLock = new DynamoUpdateItem(this, `Acquire ${lockName} Lock: ${lockInfo.timesUsed}`,
      {
        comment: comments ? `Acquire a lock using a conditional update to DynamoDB. This update will do two things:
          1) increment a counter for the number of held locks
          2) add an attribute to the DynamoDB Item with a unique key for this execution and with a value of the time when the lock was Acquired
          The Update includes a conditional expression that will fail under two circumstances:
          1) if the maximum number of locks have already been distributed
          2) if the current execution already owns a lock. The latter check is important to ensure the same execution doesn't increase the counter more than once
          If either of these conditions are not met, then the task will fail with a DynamoDB.ConditionalCheckFailedException error, retry a few times, then if it is still not successful \
          it will move off to another branch of the workflow. If this is the first time that a given lockname has been used, there will not be a row in DynamoDB \
          so the update will fail with DynamoDB.AmazonDynamoDBException. In that case, this state sends the workflow to state that will create that row to initialize.
          ` : undefined,
        table: this.semaphoreTable,
        key: { LockName: DynamoAttributeValue.fromString(lockName) },
        expressionAttributeNames: {
          '#currentlockcount': 'currentlockcount',
          '#lockownerid.$': '$$.Execution.Id',
        },
        expressionAttributeValues: {
          ':increase': DynamoAttributeValue.fromNumber(1),
          ':limit': DynamoAttributeValue.fromNumber(limit),
          ':lockacquiredtime': DynamoAttributeValue.fromString(JsonPath.stringAt('$$.State.EnteredTime')),
        },
        updateExpression: 'SET #currentlockcount = #currentlockcount + :increase, #lockownerid = :lockacquiredtime',
        conditionExpression: 'currentlockcount <> :limit and attribute_not_exists(#lockownerid)',
        returnValues: DynamoReturnValues.UPDATED_NEW,
        resultPath: '$.lockinfo.acquirelock',
      },
    );
    const initializeLockItem = new DynamoPutItem(this, `Initialize ${lockName} Lock Item: ${lockInfo.timesUsed}`, {
      comment: comments ? `This state handles the case where an item hasn't been created for this lock yet. \
      In that case, it will insert an initial item that includes the lock name as the key and currentlockcount of 0. \ 
      The Put to DynamoDB includes a conditonal expression to fail if the an item with that key already exists, which avoids a race condition if multiple executions start at the same time. \ 
      There are other reasons that the previous state could fail and end up here, so this is safe in those cases too.` : undefined,
      table: this.semaphoreTable,
      item: {
        LockName: DynamoAttributeValue.fromString(lockName),
        currentlockcount: DynamoAttributeValue.fromNumber(0),
      },
      conditionExpression: 'LockName <> :lockname',
      expressionAttributeValues: {
        ':lockname': DynamoAttributeValue.fromString(lockName),
      },
      resultPath: JsonPath.DISCARD,
    });

    const getCurrentLockRecord = new DynamoGetItem(this, `Get Current ${lockName} Lock Record: ${lockInfo.timesUsed}`, {
      comment: comments ? 'This state is called when the execution is unable to acquire a lock because there limit has either been exceeded or because this execution already holds a lock. \
      In that case, this task loads info from DDB for the current lock item so that the right decision can be made in subsequent states.': undefined,
      table: this.semaphoreTable,
      key: { LockName: DynamoAttributeValue.fromString(lockName) },
      expressionAttributeNames: { '#lockownerid.$': '$$.Execution.Id' },
      projectionExpression: [new DynamoProjectionExpression().withAttribute('#lockownerid')],
      resultSelector: {
        'Item.$': '$.Item',
        'ItemString.$': 'States.JsonToString($.Item)',
      },
      resultPath: '$.lockinfo.currentlockitem',
    });
    const checkIfLockAcquired = new Choice(this, `Check if ${lockName} Lock Already Acquired: ${lockInfo.timesUsed}`, {
      comment: comments ? `This state checks to see if the current execution already holds a lock. It can tell that by looking for Z, which will be indicative of the timestamp value. \ 
      That will only be there in the stringified version of the data returned from DDB if this execution holds a lock.`: undefined,
    });
    const continueBecauseLockWasAlreadyAcquired = new Pass(this, `Continue Because ${lockName} Lock Was Already Acquired: ${lockInfo.timesUsed}`, {
      comment: comments ? 'In this state, we have confimed that lock is already held, so we pass the original execution input into the the function that does the work.' : undefined,
    });
    const waitToGetLock = new Wait(this, `Wait to Get ${lockName} Lock: ${lockInfo.timesUsed}`, {
      comment: comments ? 'If the lock indeed not been succesfully Acquired, then wait for a bit before trying again.' : undefined,
      time: WaitTime.duration(Duration.seconds(3)),
    });
    acquireLock.addRetry({ errors: ['DynamoDB.AmazonDynamoDBException'], maxAttempts: 0 })
      .addRetry({ maxAttempts: 6, backoffRate: 2 })
      .addCatch(initializeLockItem, { errors: ['DynamoDB.AmazonDynamoDBException'], resultPath: '$.lockinfo.acquisitionerror' })
      .addCatch(getCurrentLockRecord, { errors: ['DynamoDB.ConditionalCheckFailedException'], resultPath: '$.lockinfo.acquisitionerror' });
    initializeLockItem.addCatch(acquireLock, { resultPath: JsonPath.DISCARD });
    getCurrentLockRecord.next(checkIfLockAcquired);
    checkIfLockAcquired.when(Condition.and(
      Condition.isPresent('$.lockinfo.currentlockitem.ItemString'),
      Condition.stringMatches('$.lockinfo.currentlockitem.ItemString', '*Z')), continueBecauseLockWasAlreadyAcquired,
    );
    checkIfLockAcquired.otherwise(waitToGetLock);
    waitToGetLock.next(acquireLock);

    const releaseLock = new DynamoUpdateItem(this, `Release ${lockName} Lock: ${lockInfo.timesUsed}`, {
      table: this.semaphoreTable,
      key: { LockName: DynamoAttributeValue.fromString(lockName) },
      expressionAttributeNames: {
        '#currentlockcount': 'currentlockcount',
        '#lockownerid.$': '$$.Execution.Id',
      },
      expressionAttributeValues: {
        ':decrease': DynamoAttributeValue.fromNumber(1),
      },
      updateExpression: 'SET #currentlockcount = #currentlockcount - :decrease REMOVE #lockownerid',
      conditionExpression: 'attribute_exists(#lockownerid)',
      returnValues: DynamoReturnValues.UPDATED_NEW,
      resultPath: JsonPath.DISCARD,
    });

    releaseLock.addRetry({ errors: ['DynamoDB.ConditionalCheckFailedException'], maxAttempts: 0 })
      .addRetry({ maxAttempts: 5, backoffRate: 1.5 })
      .addCatch(nextState, { errors: ['DynamoDB.ConditionalCheckFailedException'], resultPath: '$.lockinfo.acquisitionerror' })
      .next(nextState);
    getLock.branch(acquireLock);
    getLock.endStates.forEach(j => j.next(job));
    job.next(releaseLock);
    class SemaphoredJob extends StateMachineFragment {
      public readonly startState = getLock;
      public readonly endStates = nextState.endStates;
    }
    return new SemaphoredJob(this, `${lockName}${lockInfo.timesUsed}`);
  }
}
