import path from 'path';
import { pluginTester } from 'babel-plugin-tester';
import plugin from '../src';

pluginTester({
  plugin,
  title: 'Convert JSX',
  fixtures: path.join(__dirname, '__fixtures__'),
  snapshot: true,
});
