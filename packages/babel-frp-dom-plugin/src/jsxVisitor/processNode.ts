import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { JSXProcessResult, ProcessContext } from '../types';
import { processExpressionContainer } from './processJSXExpression';
import { processArrayChildren, processJSXElement } from './processJSXElement';
import { processJSXText } from './processText';
import { processJSXSpreadChild } from './processJSXSpreadChild';

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
    return processJSXSpreadChild(path as NodePath<t.JSXSpreadChild>, context);
  }

  if (t.isJSXText(path.node)) {
    return processJSXText(path as NodePath<t.JSXText>, context);
  }

  throw Error(`Unexpected element type: ${path.node.type}`);
}
