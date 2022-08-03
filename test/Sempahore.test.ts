import { App, Duration, Stack } from 'aws-cdk-lib';
import { Wait, WaitTime } from 'aws-cdk-lib/aws-stepfunctions';
import { SemaphoreGenerator } from '../src';

let stack: Stack;
let app: App;
let generator: SemaphoreGenerator;

beforeEach(() => {
  // GIVEN
  app = new App();
  stack = new Stack(app, 'test');
  generator = new SemaphoreGenerator(stack, 'SemaphoreGenerator');
});
test('No duplicate lock name by default', () => {
  const wait = new Wait(stack, 'Wait', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait2 = new Wait(stack, 'Wait2', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait3 = new Wait(stack, 'Wait3', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait4 = new Wait(stack, 'Wait4', { time: WaitTime.duration(Duration.seconds(7)) });
  generator.generateSemaphoredJob('life', 42, wait, wait2);
  expect(() => {
    generator.generateSemaphoredJob('life', 42, wait3, wait4);
  }).toThrowError(/The `lockName` "\w*" was reused/);
});

test('Duplicate lock name fail on different limit', () => {
  const wait = new Wait(stack, 'Wait', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait2 = new Wait(stack, 'Wait2', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait3 = new Wait(stack, 'Wait3', { time: WaitTime.duration(Duration.seconds(7)) });
  const wait4 = new Wait(stack, 'Wait4', { time: WaitTime.duration(Duration.seconds(7)) });
  generator.generateSemaphoredJob('life', 42, wait, wait2);
  expect(() => {
    generator.generateSemaphoredJob('life', 7, wait3, wait4, true);
  }).toThrowError(/The reused `lockName`/);
});