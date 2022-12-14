const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  author: 'Arun Donti',
  authorAddress: 'dontirun@gmail.com',
  cdkVersion: '2.22.0',
  defaultReleaseBranch: 'main',
  devDeps: ['cdk-nag@^2.15.32'],
  name: 'state-machine-semaphore',
  packageName: '@dontirun/state-machine-semaphore',
  description:
    'Create distributed semaphores using AWS Step Functions and Amazon DynamoDB to control concurrent invocations of contentious work.',
  repositoryUrl: 'https://github.com/dontirun/state-machine-semaphore.git',
  keywords: ['dynamodb', 'step functions', 'state machine'],
  pullRequestTemplateContents: [
    '',
    '----',
    '',
    '*By submitting this pull request, I confirm that my contribution is made under the terms of the Apache-2.0 license*',
  ],
  publishToPypi: {
    distName: 'state-machine-semaphore',
    module: 'state_machine_semaphore',
  },
  publishToNuget: {
    packageId: 'Dontirun.StateMachineSemaphore',
    dotNetNamespace: 'Dontirun.StateMachineSemaphore',
  },
  publishToMaven: {
    mavenGroupId: 'io.github.dontirun',
    javaPackage: 'io.github.dontirun.statemachinesemaphore',
    mavenArtifactId: 'statemachinesemaphore',
    mavenEndpoint: 'https://s01.oss.sonatype.org',
  },
  publishToGo: {
    moduleName: 'github.com/dontirun/state-machine-semaphore-go',
    githubUseSsh: true,
  },
  autoApproveOptions: {
    allowedUsernames: ['github-bot', 'dontirun'],
    secret: 'GITHUB_TOKEN',
  },
  autoApproveUpgrades: true,
  depsUpgradeOptions: {
    workflowOptions: {
      labels: ['auto-approve'],
    },
  },
});
project.synth();
