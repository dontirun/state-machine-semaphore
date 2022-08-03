# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### SemaphoreGenerator <a name="SemaphoreGenerator" id="@dontirun/state-machine-semaphore.SemaphoreGenerator"></a>

Sets up up the DynamoDB table that stores the State Machine semaphores.

Call `generateSemaphoredJob` to generate semaphored jobs.

#### Initializers <a name="Initializers" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.Initializer"></a>

```typescript
import { SemaphoreGenerator } from '@dontirun/state-machine-semaphore'

new SemaphoreGenerator(scope: Construct, id: string, props?: SemaphoreGeneratorProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@dontirun/state-machine-semaphore.SemaphoreGenerator.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@dontirun/state-machine-semaphore.SemaphoreGenerator.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@dontirun/state-machine-semaphore.SemaphoreGenerator.Initializer.parameter.props">props</a></code> | <code><a href="#@dontirun/state-machine-semaphore.SemaphoreGeneratorProps">SemaphoreGeneratorProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.Initializer.parameter.props"></a>

- *Type:* <a href="#@dontirun/state-machine-semaphore.SemaphoreGeneratorProps">SemaphoreGeneratorProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@dontirun/state-machine-semaphore.SemaphoreGenerator.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@dontirun/state-machine-semaphore.SemaphoreGenerator.generateSemaphoredJob">generateSemaphoredJob</a></code> | Generates a semaphore for a StepFunction job (or chained set of jobs) to limit parallelism across executions. |

---

##### `toString` <a name="toString" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `generateSemaphoredJob` <a name="generateSemaphoredJob" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.generateSemaphoredJob"></a>

```typescript
public generateSemaphoredJob(lockName: string, limit: number, job: IChainNextable, nextState: State, reuseLock?: boolean, comments?: boolean): StateMachineFragment
```

Generates a semaphore for a StepFunction job (or chained set of jobs) to limit parallelism across executions.

###### `lockName`<sup>Required</sup> <a name="lockName" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.generateSemaphoredJob.parameter.lockName"></a>

- *Type:* string

The name of the semaphore.

---

###### `limit`<sup>Required</sup> <a name="limit" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.generateSemaphoredJob.parameter.limit"></a>

- *Type:* number

The maximum number of concurrent executions for the given lock.

---

###### `job`<sup>Required</sup> <a name="job" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.generateSemaphoredJob.parameter.job"></a>

- *Type:* <a href="#@dontirun/state-machine-semaphore.IChainNextable">IChainNextable</a>

The job (or chained jobs) to be semaphored.

---

###### `nextState`<sup>Required</sup> <a name="nextState" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.generateSemaphoredJob.parameter.nextState"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.State

The State to go to after the semaphored job completes.

---

###### `reuseLock`<sup>Optional</sup> <a name="reuseLock" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.generateSemaphoredJob.parameter.reuseLock"></a>

- *Type:* boolean

Explicility allow the reuse of a named lock from a previously generated job.

Throws an error if a different `limit` is specified. Default: false.

---

###### `comments`<sup>Optional</sup> <a name="comments" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.generateSemaphoredJob.parameter.comments"></a>

- *Type:* boolean

Adds detailed comments to lock related states.

Significantly increases CloudFormation template size. Default: false.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@dontirun/state-machine-semaphore.SemaphoreGenerator.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.isConstruct"></a>

```typescript
import { SemaphoreGenerator } from '@dontirun/state-machine-semaphore'

SemaphoreGenerator.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@dontirun/state-machine-semaphore.SemaphoreGenerator.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="@dontirun/state-machine-semaphore.SemaphoreGenerator.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### SemaphoreGeneratorProps <a name="SemaphoreGeneratorProps" id="@dontirun/state-machine-semaphore.SemaphoreGeneratorProps"></a>

Interface for creating a SemaphoreGenerator.

#### Initializer <a name="Initializer" id="@dontirun/state-machine-semaphore.SemaphoreGeneratorProps.Initializer"></a>

```typescript
import { SemaphoreGeneratorProps } from '@dontirun/state-machine-semaphore'

const semaphoreGeneratorProps: SemaphoreGeneratorProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@dontirun/state-machine-semaphore.SemaphoreGeneratorProps.property.tableReadWriteCapacity">tableReadWriteCapacity</a></code> | <code><a href="#@dontirun/state-machine-semaphore.TableReadWriteCapacity">TableReadWriteCapacity</a></code> | Optionally set the DynamoDB table to have a specific read/write capacity with PROVISIONED billing. |

---

##### `tableReadWriteCapacity`<sup>Optional</sup> <a name="tableReadWriteCapacity" id="@dontirun/state-machine-semaphore.SemaphoreGeneratorProps.property.tableReadWriteCapacity"></a>

```typescript
public readonly tableReadWriteCapacity: TableReadWriteCapacity;
```

- *Type:* <a href="#@dontirun/state-machine-semaphore.TableReadWriteCapacity">TableReadWriteCapacity</a>
- *Default:* PAY_PER_REQUEST

Optionally set the DynamoDB table to have a specific read/write capacity with PROVISIONED billing.

---

### TableReadWriteCapacity <a name="TableReadWriteCapacity" id="@dontirun/state-machine-semaphore.TableReadWriteCapacity"></a>

Read and write capacity for a PROVISIONED billing DynamoDB table.

#### Initializer <a name="Initializer" id="@dontirun/state-machine-semaphore.TableReadWriteCapacity.Initializer"></a>

```typescript
import { TableReadWriteCapacity } from '@dontirun/state-machine-semaphore'

const tableReadWriteCapacity: TableReadWriteCapacity = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@dontirun/state-machine-semaphore.TableReadWriteCapacity.property.readCapacity">readCapacity</a></code> | <code>number</code> | *No description.* |
| <code><a href="#@dontirun/state-machine-semaphore.TableReadWriteCapacity.property.writeCapacity">writeCapacity</a></code> | <code>number</code> | *No description.* |

---

##### `readCapacity`<sup>Required</sup> <a name="readCapacity" id="@dontirun/state-machine-semaphore.TableReadWriteCapacity.property.readCapacity"></a>

```typescript
public readonly readCapacity: number;
```

- *Type:* number

---

##### `writeCapacity`<sup>Required</sup> <a name="writeCapacity" id="@dontirun/state-machine-semaphore.TableReadWriteCapacity.property.writeCapacity"></a>

```typescript
public readonly writeCapacity: number;
```

- *Type:* number

---


## Protocols <a name="Protocols" id="Protocols"></a>

### IChainNextable <a name="IChainNextable" id="@dontirun/state-machine-semaphore.IChainNextable"></a>

- *Extends:* aws-cdk-lib.aws_stepfunctions.IChainable, aws-cdk-lib.aws_stepfunctions.INextable

- *Implemented By:* <a href="#@dontirun/state-machine-semaphore.IChainNextable">IChainNextable</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@dontirun/state-machine-semaphore.IChainNextable.property.endStates">endStates</a></code> | <code>aws-cdk-lib.aws_stepfunctions.INextable[]</code> | The chainable end state(s) of this chainable. |
| <code><a href="#@dontirun/state-machine-semaphore.IChainNextable.property.id">id</a></code> | <code>string</code> | Descriptive identifier for this chainable. |
| <code><a href="#@dontirun/state-machine-semaphore.IChainNextable.property.startState">startState</a></code> | <code>aws-cdk-lib.aws_stepfunctions.State</code> | The start state of this chainable. |

---

##### `endStates`<sup>Required</sup> <a name="endStates" id="@dontirun/state-machine-semaphore.IChainNextable.property.endStates"></a>

```typescript
public readonly endStates: INextable[];
```

- *Type:* aws-cdk-lib.aws_stepfunctions.INextable[]

The chainable end state(s) of this chainable.

---

##### `id`<sup>Required</sup> <a name="id" id="@dontirun/state-machine-semaphore.IChainNextable.property.id"></a>

```typescript
public readonly id: string;
```

- *Type:* string

Descriptive identifier for this chainable.

---

##### `startState`<sup>Required</sup> <a name="startState" id="@dontirun/state-machine-semaphore.IChainNextable.property.startState"></a>

```typescript
public readonly startState: State;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.State

The start state of this chainable.

---

