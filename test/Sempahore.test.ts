import { App, Duration, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { StateMachine, Succeed, Wait, WaitTime } from 'aws-cdk-lib/aws-stepfunctions';
import { Semaphore } from '../src';

let app: App;
let stack: Stack;
beforeEach(() => {
  // GIVEN
  app = new App();
  stack = new Stack(app, 'test');
});
test('No duplicate lock name by default', () => {
  const wait = new Wait(stack, 'Wait', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait2 = new Wait(stack, 'Wait2', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait3 = new Wait(stack, 'Wait3', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait4 = new Wait(stack, 'Wait4', { time: WaitTime.duration(Duration.seconds(7)) });
  new Semaphore(stack, 'Semaphore1', { lockName: 'life', limit: 42, job: wait, nextState: wait2 });
  expect(() => {
    new Semaphore(stack, 'Semaphore2', { lockName: 'life', limit: 42, job: wait3, nextState: wait4 });
  }).toThrowError(/The `lockName` "\w*" was reused/);
});

test('Duplicate lock name fail on different limit', () => {
  const wait = new Wait(stack, 'Wait', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait2 = new Wait(stack, 'Wait2', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait3 = new Wait(stack, 'Wait3', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait4 = new Wait(stack, 'Wait4', { time: WaitTime.duration(Duration.seconds(7)) });
  new Semaphore(stack, 'Semaphore1', { lockName: 'life', limit: 42, job: wait, nextState: wait2 });
  expect(() => {
    new Semaphore(stack, 'Semaphore2', { lockName: 'life', limit: 7, job: wait3, nextState: wait4, reuseLock: true });
  }).toThrowError(/The reused `lockName`/);
});

test('Only 1 DynamoDB Table', () => {
  const wait = new Wait(stack, 'Wait', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait2 = new Wait(stack, 'Wait2', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait3 = new Wait(stack, 'Wait3', { time: WaitTime.duration(Duration.seconds(7)) });
  new StateMachine(stack, 'machine', {
    definition: new Semaphore(stack, 'Semaphore1', { lockName: 'life', limit: 42, job: wait, nextState: wait2 })
      .next(new Semaphore(stack, 'Semaphore2', { lockName: 'liberty', limit: 7, job: wait3, nextState: new Succeed(stack, 'Succeed') })),
  });

  Template.fromStack(stack).resourceCountIs('AWS::DynamoDB::Table', 1);
});