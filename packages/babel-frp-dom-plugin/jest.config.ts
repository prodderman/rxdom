/* eslint-disable */
export default {
  displayName: 'babel-frp-dom-plugin',
  transform: {
    '^.+\\.[tj]sx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testEnvironment: 'jsdom',
  watchPathIgnorePatterns: ['output.js'],
  coverageDirectory: '.coverage',
};
