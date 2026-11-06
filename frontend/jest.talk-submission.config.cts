const { createCjsPreset } = require('jest-preset-angular/presets');

/** @type {import('jest').Config} */
module.exports = {
  displayName: 'frontend-talk-submission',
  ...createCjsPreset({
    tsconfig: '<rootDir>/tsconfig.talk-submission.json',
  }),
  setupFilesAfterEnv: ['<rootDir>/test-setup-talk-submission.ts'],
  testMatch: ['<rootDir>/src/app/talk-submission/talk-submission.spec.ts'],
  moduleNameMapper: {
    '^@cfp-platform/shared-types$': '<rootDir>/../shared-types/src/index.ts',
  },
  coverageDirectory: '../coverage/frontend',
};
