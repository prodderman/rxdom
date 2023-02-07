/* eslint-disable */
export default {
  displayName: 'babel-frp-dom-plugin',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  watchPathIgnorePatterns: ['output.js'],
  coverageDirectory: '../../coverage/packages/babel-frp-dom-plugin',
};
