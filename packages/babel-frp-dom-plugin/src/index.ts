import type { PluginObj, PluginPass } from '@babel/core';
import SyntaxJSX from '@babel/plugin-syntax-jsx';
import { transformJSX } from './transform';
import { postprocess, preprocess } from './programVisitor';

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
