import path from 'path';
import { Configuration } from 'webpack';

const outPath = path.resolve(
  process.cwd(),
  'dist/packages/babel-frp-dom-plugin'
);

const config: Configuration = {
  mode: 'production',
  entry: {
    index: path.resolve(__dirname, 'src/index.ts'),
  },
  output: {
    path: outPath,
    clean: true,
    globalObject: 'this',
    library: {
      commonjs: 'index',
    },
    libraryTarget: 'umd',
  },

  optimization: {
    minimize: false,
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [['@nrwl/js/babel', { useBuiltIns: 'usage' }]],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
    ],
  },

  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      assert: require.resolve('assert'),
    },
  },
};

export default config;
