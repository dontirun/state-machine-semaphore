import { App, Aspects, Duration, Stack } from 'aws-cdk-lib';
import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { StateMachine, Wait, WaitTime } from 'aws-cdk-lib/aws-stepfunctions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { Semaphore } from '../src';

describe('cdk-nag AwsSolutions Pack', () => {
  let stack: Stack;
  let app: App;
  beforeEach(() => {
    // GIVEN
    app = new App();
    stack = new Stack(app, 'test');
    const wait = new Wait(stack, 'Wait', { time: WaitTime.duration(Duration.seconds(7)) });
    const wait2 = new Wait(stack, 'Wait2', { time: WaitTime.duration(Duration.seconds(7)) });
    const machine = new StateMachine(stack, 'machine', {
      definition: new Semaphore(stack, 'Semaphore', { lockName: 'life', limit: 42, job: wait, nextState: wait2 }),
    });
    // WHEN
    Aspects.of(stack).add(new AwsSolutionsChecks());
    NagSuppressions.addResourceSuppressionsByPath(stack, '/test/StateMachineSempahoreTable920751a65a584e8ab7583460f6db686a/Resource',
      [{ id: 'AwsSolutions-DDB3', reason: 'Point-in-time recovery does not make sense for sempahores' }],
    );
    NagSuppressions.addResourceSuppressions(machine,
      [
        { id: 'AwsSolutions-SF1', reason: 'The actual state machine is out of scope of the construct' },
        { id: 'AwsSolutions-SF2', reason: 'The actual state machine is out of scope of the construct' },
      ],
    );
  });

  // THEN
  test('No unsuppressed Warnings', () => {
    const warnings = Annotations.fromStack(stack).findWarning(
      '*',
      Match.stringLikeRegexp('AwsSolutions-.*'),
    );
    expect(warnings).toHaveLength(0);
  });

  test('No unsuppressed Errors', () => {
    const errors = Annotations.fromStack(stack).findError(
      '*',
      Match.stringLikeRegexp('AwsSolutions-.*'),
    );
    expect(errors).toHaveLength(0);
  });
});
