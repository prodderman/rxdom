import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { JSXProcessResult, ProcessContext } from '../types';
import { processExpressionContainer } from './processExpression';
import { processArrayChildren, processJSXElement } from './processJSXElement';
import { processJSXText } from './processText';

export function processNode(
  path: NodePath,
  context: ProcessContext
): JSXProcessResult {
  if (t.isJSXElement(path.node)) {
    return processJSXElement(path as NodePath<t.JSXElement>, context);
  }

  if (t.isJSXFragment(path.node)) {
    const children = processArrayChildren(path as NodePath<t.JSXFragment>);
    return {
      id: null,
      template: '',
      declarations: [],
      expressions: [
        children.length === 1 ? children[0] : t.arrayExpression(children),
      ],
    };
  }

  if (t.isJSXExpressionContainer(path.node)) {
    return processExpressionContainer(
      path as NodePath<t.JSXExpressionContainer>,
      context
    );
  }

  if (t.isJSXSpreadChild(path.node)) {
    return {
      id: null,
      template: '',
      declarations: [],
      expressions: [path.node.expression],
    };
  }

  if (t.isJSXText(path.node)) {
    return processJSXText(path as NodePath<t.JSXText>, context);
  }

  throw Error(`Unexpected element type: ${path.node.type}`);
}
