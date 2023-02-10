import { NodePath, PluginPass } from '@babel/core';
import * as t from '@babel/types';
import { isValidHTMLNesting } from 'validate-html-nesting';

import { DEFAULT_CONFIG } from '../constants';
import { isComponent } from '../utils';

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

export const preprocess = (path: NodePath<t.Program>, state: PluginPass) => {
  path.traverse(JSXValidator);
  path.scope.setData('config', Object.assign({}, DEFAULT_CONFIG, state.opts));
  path.scope.setData('templates', new Map());
  path.scope.setData('imports', new Map());
};
