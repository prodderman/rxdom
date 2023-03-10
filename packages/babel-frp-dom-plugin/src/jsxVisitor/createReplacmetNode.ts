import * as t from '@babel/types';
import { registerTemplate } from '../programVisitor';
import { JSXNodePath, JSXProcessResult } from '../types';

export function createReplacementNode(
  path: JSXNodePath,
  result: JSXProcessResult
): t.Node {
  if (result.id && result.template !== '') {
    const templateId = registerTemplate(path, result.template);

    const cloneNodeExpression = t.callExpression(
      t.memberExpression(templateId, t.identifier('cloneNode')),
      [t.booleanLiteral(true)]
    );

    if (result.declarations.length === 0 && result.expressions.length === 0) {
      return cloneNodeExpression;
    }

    return t.callExpression(
      t.arrowFunctionExpression(
        [],
        t.blockStatement([
          t.variableDeclaration(
            'const',
            [t.variableDeclarator(result.id, cloneNodeExpression)].concat(
              result.declarations
            )
          ),
          ...result.expressions.map(t.expressionStatement),
          t.returnStatement(result.id),
        ])
      ),
      []
    );
  }

  if (result.expressions.length === 1) {
    return result.expressions[0];
  }

  return path.node;
}
