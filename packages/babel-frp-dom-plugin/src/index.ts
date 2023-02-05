import type { PluginObj } from '@babel/core';
import SyntaxJSX from '@babel/plugin-syntax-jsx';
import { transformJSX } from './shared/transform';
// import postprocess from './shared/postprocess';
// import preprocess from './shared/preprocess';

export default (): PluginObj => {
  return {
    name: 'JSX DOM Expressions',
    inherits: SyntaxJSX,
    visitor: {
      JSXElement: transformJSX,
      JSXFragment: transformJSX,
      // Program: {
      //   enter: preprocess,
      //   exit: postprocess,
      // },
    },
  };
};
