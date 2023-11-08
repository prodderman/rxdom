import * as t from '@babel/types';
import { registerTemplate } from '../program';
import { JSXNodePath, JSXProcessResult } from '../types';

export function createReplacementNode(
  path: JSXNodePath,
  result: JSXProcessResult
): t.Node {
  if (result.id && result.template !== '') {
    const templateId = registerTemplate(path, result.template);

    const templateExpression = t.callExpression(templateId, []);

    if (result.declarations.length === 0 && result.expressions.length === 0) {
      return templateExpression;
    }

    return t.arrowFunctionExpression(
      [t.identifier('context')],
      t.blockStatement([
        t.variableDeclaration(
          'const',
          [t.variableDeclarator(result.id, templateExpression)].concat(
            result.declarations
          )
        ),
        ...result.expressions.map(t.expressionStatement),
        t.returnStatement(result.id),
      ])
    );
  }

  if (result.expressions.length === 1) {
    return result.expressions[0];
  }

  return path.node;
}
