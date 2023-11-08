import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { registerImport } from '../program';
import { ProcessContext, JSXProcessResult } from '../types';
import {
  convertComponentIdentifier,
  isJSXAttributePath,
  isJSXExpressionContainerPath,
  isJSXSpreadAttributePath,
  processChildren,
} from '../utils';
import { parseAttributeName } from '../attributes';

export function processComponent(
  path: NodePath<t.JSXElement>,
  context: ProcessContext
): JSXProcessResult {
  const id = !context.skipId
    ? path.scope.generateUidIdentifierBasedOnNode(path.node)
    : null;

  const componentName = convertComponentIdentifier(
    path.node.openingElement.name
  );

  const childrenResults = processChildren(path);

  const props = t.objectExpression(
    processComponentProps(path).concat(
      childrenResults.length > 0
        ? [
            t.objectProperty(
              t.stringLiteral('children'),
              childrenResults.length === 1
                ? childrenResults[0]
                : t.arrayExpression(childrenResults)
            ),
          ]
        : []
    )
  );

  const componentExpression = t.callExpression(
    registerImport(path, 'createComponent'),
    [componentName, props]
  );

  const resultExpression = context.parentId
    ? t.callExpression(registerImport(path, 'insert'), [
        t.identifier('context'),
        context.parentId,
        componentExpression,
        ...(id ? [id] : []),
      ])
    : componentExpression;

  return {
    id,
    expressions: [resultExpression],
    declarations: [],
    template: context.parentId && !context.skipId ? '<!>' : '',
  };
}

function processComponentProps(
  path: NodePath<t.JSXElement>
): Array<t.ObjectProperty | t.SpreadElement> {
  const props = path.get('openingElement').get('attributes');
  const result: Array<t.ObjectProperty | t.SpreadElement> = [];

  for (const prop of props) {
    if (isJSXSpreadAttributePath(prop)) {
      result.push(t.spreadElement(prop.node.argument));
    } else if (isJSXAttributePath(prop)) {
      const { key } = parseAttributeName(prop);
      const propKey = t.stringLiteral(key);
      const value = prop.get('value');

      if (value.node === null || value.node === undefined) {
        result.push(t.objectProperty(propKey, t.booleanLiteral(true)));
      } else if (t.isStringLiteral(value.node)) {
        result.push(t.objectProperty(propKey, value.node));
      } else if (isJSXExpressionContainerPath(value)) {
        const expression = value.get('expression').node;

        if (t.isExpression(expression)) {
          result.push(t.objectProperty(propKey, expression));
        }
      } else {
        result.push(
          t.objectProperty(propKey, value.node as t.JSXElement | t.JSXFragment)
        );
      }
    }
  }

  return result;
}
