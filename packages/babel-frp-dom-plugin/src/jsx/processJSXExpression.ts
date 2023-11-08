import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { encode } from 'html-entities';
import { registerImport } from '../program';

import { JSXProcessResult, ProcessContext } from '../types';
import { genId } from '../utils';
import { evalExpression } from '../expression';

export function processExpressionContainer(
  path: NodePath<t.JSXExpressionContainer>,
  context: ProcessContext
): JSXProcessResult {
  if (!context.parentId) throw Error('Impossible situation happened');
  const id = genId(path, context);
  const result: JSXProcessResult = {
    id: null,
    template: '',
    expressions: [],
    declarations: [],
  };

  const evalResult = evalExpression(path.get('expression'));

  if (evalResult.kind === 'void' || evalResult.kind === 'empty') {
    return result;
  }

  if (evalResult.kind === 'primitive') {
    result.id = id('text');
    result.template = encode(evalResult.value.toString());
    return result;
  }

  result.id = id('marker');
  result.template = context.skipId ? '' : '<!>';
  result.expressions.push(
    t.callExpression(registerImport(path, 'insert'), [
      t.identifier('context'),
      context.parentId,
      evalResult.expression,
      ...(result.id ? [result.id] : []),
    ])
  );

  return result;
}
