import { NodePath, PluginPass } from '@babel/core';
import * as t from '@babel/types';
import config from '../config';
import { isComponent } from './utils';
import { isValidHTMLNesting } from 'validate-html-nesting';

// From https://github.com/MananTank/babel-plugin-validate-jsx-nesting/blob/main/src/index.js
const JSXValidator = {
  JSXElement(path: NodePath<t.JSXElement>) {
    const elName = path.node.openingElement.name;
    const parent = path.parent;
    if (!t.isJSXElement(parent) || !t.isJSXIdentifier(elName)) return;
    const elTagName = elName.name;
    if (isComponent(elTagName)) return;
    const parentElName = parent.openingElement.name;
    if (!t.isJSXIdentifier(parentElName)) return;
    const parentElTagName = parentElName.name;
    if (!isComponent(parentElTagName)) {
      if (!isValidHTMLNesting(parentElTagName, elTagName)) {
        throw path.buildCodeFrameError(
          `Invalid JSX: <${elTagName}> cannot be child of <${parentElTagName}>`
        );
      }
    }
  },
};

export default (path: NodePath<t.Program>, state: PluginPass) => {
  state.opts = Object.assign({}, config, state.opts);
  path.scope.setData('templates', []);
  path.scope.setData('imports', new Map());
  path.traverse(JSXValidator);
};
