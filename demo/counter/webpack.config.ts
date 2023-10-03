import path from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { Configuration } from 'webpack';
import 'webpack-dev-server';

const isProduction = process.env.NODE_ENV == 'production';

const stylesHandler = isProduction
  ? MiniCssExtractPlugin.loader
  : 'style-loader';

const config: Configuration = {
  mode: isProduction ? 'production' : 'development',
  entry: path.resolve(__dirname, 'src/index.tsx'),
  devtool: 'eval-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
  },
  devServer: {
    open: false,
    host: 'localhost',
    hot: true,
    port: 8000,
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/assets/index.html'),
      favicon: path.resolve(__dirname, 'src/assets/favicon.ico'),
    }),
  ].filter(Boolean),

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
    ],
  },

  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: path.resolve(__dirname, 'tsconfig.app.json'),
        extensions: ['.js', '.ts', '.d.ts'],
      }),
    ],
  },
};

export default config;
