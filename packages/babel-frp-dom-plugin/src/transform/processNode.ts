import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import {
  JSXChildren,
  JSXElementResult,
  JSXExpressionResult,
  JSXTextResult,
  ProcessContext,
  ProcessResult,
} from '../types';
import { processExpressionContainer } from './processExpression';
import { processJSXElement } from './processJSXElement';

export function processNode(
  path: NodePath<t.JSXElement>,
  context: ProcessContext
): JSXElementResult;
export function processNode(
  path: NodePath<t.JSXFragment>,
  context: ProcessContext
): any;
export function processNode(
  path: NodePath<t.JSXExpressionContainer>,
  context: ProcessContext
): JSXExpressionResult;
export function processNode(
  path: NodePath<t.JSXText>,
  context: ProcessContext
): JSXTextResult;
export function processNode(
  path: NodePath<t.JSXSpreadChild>,
  context: ProcessContext
): any;
export function processNode(
  path: NodePath<JSXChildren>,
  context: ProcessContext
): ProcessResult;
export function processNode(
  path: NodePath<JSXChildren>,
  context: ProcessContext
): ProcessResult {
  if (t.isJSXElement(path.node)) {
    return processJSXElement(path as NodePath<t.JSXElement>, context);
  }

  if (t.isJSXExpressionContainer(path.node)) {
    return processExpressionContainer(
      path as NodePath<t.JSXExpressionContainer>,
      context
    );
  }

  if (t.isJSXText(path.node)) {
    return {
      id: path.scope.generateUidIdentifierBasedOnNode(path.node, 'text$'),
      kind: 'text',
      template: trimWhitespace((path.node.extra?.raw as string) ?? ''),
    };
  }

  throw Error('unexpected element type');
}

function trimWhitespace(text: string) {
  text = text.replace(/\r/g, '');
  if (/\n/g.test(text)) {
    text = text
      .split('\n')
      .map((t, i) => (i ? t.replace(/^\s*/g, '') : t))
      .filter((s) => !/^\s*$/.test(s))
      .join(' ');
  }
  text = text.replace(/\s+/g, ' ');
  return text;
}
