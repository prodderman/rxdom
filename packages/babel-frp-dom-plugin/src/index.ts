import type { PluginObj, PluginPass } from '@babel/core';
import SyntaxJSX from '@babel/plugin-syntax-jsx';
import { transformJSX } from './transform';
import preprocess from './shared/preprocess';
import postprocess from './shared/postprocess';

export default (): PluginObj<PluginPass> => {
  return {
    name: 'JSX DOM Expressions',
    inherits: SyntaxJSX,
    visitor: {
      JSXElement: transformJSX,
      JSXFragment: transformJSX,
      Program: {
        enter: preprocess,
        exit: postprocess,
      },
    },
  };
};
