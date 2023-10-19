import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { JSXProcessResult, ProcessContext } from '../types';
import { processText } from '../utils';

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
