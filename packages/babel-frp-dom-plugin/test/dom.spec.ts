import path from 'path';
import fs from 'fs';
import { pluginTester } from 'babel-plugin-tester';
import plugin from '../src';
// import plugin from '../src/_original_';

pluginTester({
  plugin,
  pluginOptions: {
    moduleName: 'asd',
    generate: 'dom',
  },
  title: 'Convert JSX',
  fixtures: path.join(__dirname, '__fixtures__'),
  snapshot: true,
  setup: () => {
    try {
      fs.rmSync(path.resolve(__dirname, '__fixtures__/simple/output.js'));
    } catch (error) {
      //
    }
  },
});
