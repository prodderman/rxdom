import * as t from '@babel/types';
import { JSXNodePath, JSXElementResult } from '../types';

export function createReplacementNode(
  path: JSXNodePath,
  processResult: JSXElementResult,
  templateId: t.Identifier
): t.Node {
  const cloneExpression = t.callExpression(
    t.memberExpression(templateId, t.identifier('cloneNode')),
    [t.booleanLiteral(true)]
  );

  console.log(path.scope.getBlockParent().generateUidIdentifier('test'));
  // console.log(path.scope.generateUidIdentifier('test'));
  // console.log(path.scope.generateUidIdentifier('test'));
  if (processResult.statements.length > 0 && processResult.id) {
    return t.callExpression(
      t.arrowFunctionExpression(
        [],
        t.blockStatement([
          t.variableDeclaration('const', [
            t.variableDeclarator(processResult.id, cloneExpression),
          ]),
          ...processResult.statements,
          t.returnStatement(processResult.id),
        ])
      ),
      []
    );
  }

  return cloneExpression;
}
