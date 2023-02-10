import path from 'path';
import fs from 'fs';
import { pluginTester } from 'babel-plugin-tester';
import plugin from '../src';

try {
  fs.rmSync(path.resolve(__dirname, 'sandbox/test/output.js'));
} catch (error) {
  //
} finally {
  pluginTester({
    plugin,

    pluginOptions: {
      moduleName: '@frp/runtime',
    },
    title: 'Convert JSX',
    fixtures: path.join(__dirname, 'sandbox/'),
    snapshot: true,
  });
}
