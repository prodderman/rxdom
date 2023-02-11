import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { registerImport } from '../programVisitor';

import { JSXProcessResult, ProcessContext } from '../types';
import { genId } from '../utils';

export function processJSXSpreadChild(
  path: NodePath<t.JSXSpreadChild>,
  context: ProcessContext
): JSXProcessResult {
  if (!context.parentId) throw Error('Impossible situation happened');
  const id = genId(path, context)('spread');
  console.log(context);
  return {
    id,
    template: !context.skipId ? '<!>' : '',
    declarations: [],
    expressions: [
      t.callExpression(registerImport(path, 'insert'), [
        context.parentId,
        path.node.expression,
        ...(id ? [id] : []),
      ]),
    ],
  };
}
