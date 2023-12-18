import path from 'path';
import { pluginTester } from 'babel-plugin-tester';
import plugin from '../src';

pluginTester({
  plugin,
  pluginOptions: {
    moduleName: '@frp/runtime',
  },
  title: 'Convert JSX',
  fixtures: path.join(__dirname, 'dom-fixtures'),
  snapshot: true,
});
