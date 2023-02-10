import { NodePath } from '@babel/core';
import { decode } from 'html-entities';
import * as t from '@babel/types';

import { JSXProcessResult, ProcessContext } from '../types';

export function processJSXText(
  path: NodePath<t.JSXText>,
  context: ProcessContext
): JSXProcessResult {
  return {
    id: !context.skipId
      ? path.scope.generateUidIdentifierBasedOnNode(path.node, 'text')
      : null,
    template: processText(path.node),
    declarations: [],
    expressions: [],
  };
}

export function processText(text: t.JSXText): string {
  return decode(trimWhitespace((text.extra?.raw as string) ?? ''));
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
