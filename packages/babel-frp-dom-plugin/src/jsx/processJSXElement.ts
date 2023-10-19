import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { VOID_ELEMENTS } from '../constants';
import { registerImport } from '../program';
import { JSXProcessResult, JSXAttributesResult } from '../types';
import {
  getTagName,
  isJSXAttributePath,
  isJSXExpressionContainerPath,
  unwrapFragment,
  isChildUseless,
  isJSXSpreadAttributePath,
} from '../utils';

import { processNode } from './processNode';
import { parseAttribute, parseAttributeName } from '../attributes';

export function processJSXElement(
  path: NodePath<t.JSXElement>
): JSXProcessResult {
  const tagName = getTagName(path.node);

  const isVoidTag = VOID_ELEMENTS.includes(tagName);
  const id = path.scope.generateUidIdentifierBasedOnNode(path.node, 'el$');
  const attributesResult = processTagAttributes(path, id);

  if (isVoidTag) {
    return {
      id,
      template: `<${tagName}${attributesResult.template}/>`,
      declarations: [],
      expressions: attributesResult.expressions,
    };
  }

  const childrenResults = processTagChildren(path, id);

  const childrenTemplate = childrenResults
    .map((child) => child.template)
    .join('');

  const childrenDeclarations = childrenResults.flatMap(
    (child) => child.declarations
  );

  const childrenExpressions = childrenResults.flatMap(
    (child) => child.expressions
  );

  const needToFindElement = childrenExpressions.length > 0;
  const declarations = needToFindElement
    ? childrenResults.reduce<{
        declarations: t.VariableDeclarator[];
        prevId: t.Identifier;
      }>(
        (acc, child, idx, results) => {
          const restChildrenHaveExpressions = results
            .slice(idx)
            .some((res) => res.expressions.length > 0);

          if (child.id && restChildrenHaveExpressions) {
            acc.declarations.push(
              t.variableDeclarator(
                child.id,
                t.memberExpression(
                  acc.prevId,
                  t.identifier(idx === 0 ? 'firstChild' : 'nextSibling')
                )
              )
            );
            acc.prevId = child.id;
          }
          return acc;
        },

        { declarations: [], prevId: id }
      ).declarations
    : [];

  return {
    id,
    template: `<${tagName}${attributesResult.template}>${childrenTemplate}</${tagName}>`,
    declarations: declarations.concat(childrenDeclarations),
    expressions: attributesResult.expressions.concat(childrenExpressions),
  };
}

function processTagAttributes(
  path: NodePath<t.JSXElement>,
  nodeId: t.Identifier
): JSXAttributesResult {
  const attributes = path.get('openingElement').get('attributes');
  const spreads = attributes.filter(isJSXSpreadAttributePath);
  const singleAttributes = attributes.filter(isJSXAttributePath);

  // <div {...spread} />
  if (spreads.length === 1 && singleAttributes.length === 0) {
    const setAttributesExpression = t.callExpression(
      registerImport(path, 'setAttributes'),
      [nodeId, spreads[0].node.argument]
    );

    return {
      template: '',
      expressions: [setAttributesExpression],
    };
  }

  // <div id="root" {...spread1} class={atom} {...spread2}>
  if (spreads.length > 0) {
    let template = '';
    const objectProperties: (t.ObjectProperty | t.SpreadElement)[] = [];

    for (const attributePath of attributes) {
      if (isJSXAttributePath(attributePath)) {
        const pair = parseAttributeName(attributePath);
        const result = parseAttribute(pair, attributePath.get('value'));

        if (result.kind === 'boolean') {
          template += ' ' + result.key;
        } else if (result.kind === 'key-value') {
          template += ' ' + `${result.key}="${result.value}"`;
        } else if (result.kind === 'expression') {
          objectProperties.push(
            t.objectProperty(t.stringLiteral(result.key), result.expression)
          );
        }
      } else if (isJSXSpreadAttributePath(attributePath)) {
        objectProperties.push(t.spreadElement(attributePath.node.argument));
      }
    }

    const setAttributesExpression = t.callExpression(
      registerImport(path, 'setAttributes'),
      [nodeId, t.objectExpression(objectProperties)]
    );

    return {
      template,
      expressions: [setAttributesExpression],
    };
  }

  let template = '';
  const expressions: t.Expression[] = [];
  for (const attributePath of singleAttributes) {
    const pair = parseAttributeName(attributePath);
    const value = attributePath.get('value');

    if (pair[0].startsWith('on')) {
      const {
        template: eventHandlerTemplate,
        expressions: eventHandlerExpressions,
      } = processAsEventHandler(nodeId, pair, value);
      template += ' ' + eventHandlerTemplate;
      expressions.push(...eventHandlerExpressions);
    } else {
      const result = parseAttribute(pair, value);

      switch (result.kind) {
        case 'void':
          break;
        case 'boolean':
          template += ' ' + result.key;
          break;
        case 'key-value':
          template += ' ' + `${result.key}="${result.value}"`;
          break;
        case 'expression':
          expressions.push(
            t.callExpression(registerImport(attributePath, 'setAttribute'), [
              nodeId,
              t.stringLiteral(result.key),
              result.expression,
            ])
          );
          break;
      }
    }
  }

  return {
    template,
    expressions,
  };
}

function processTagChildren(
  path: NodePath<t.JSXElement>,
  parentId: t.Identifier
): JSXProcessResult[] {
  return path
    .get('children')
    .flatMap(unwrapFragment)
    .filter(isChildUseless)
    .map((child, _, children) => {
      return processNode(child, {
        parentId,
        skipId: children.length === 1,
      });
    });
}

function processAsEventHandler(
  nodeId: t.Identifier,
  [key, namespace]: [string, string?],
  path: NodePath<
    | t.StringLiteral
    | t.JSXElement
    | t.JSXFragment
    | t.JSXExpressionContainer
    | null
    | undefined
  >
): JSXAttributesResult {
  if (
    isJSXExpressionContainerPath(path) &&
    !t.isJSXEmptyExpression(path.node.expression)
  ) {
    const resolved = canBeResolved(path);
    const eventName = key.substring(2).toLocaleLowerCase();
    const capture = namespace === 'capture';
    if (resolved) {
      return {
        template: '',
        expressions: [
          t.callExpression(
            t.memberExpression(nodeId, t.identifier('addEventListener')),
            [
              t.stringLiteral(eventName),
              path.node.expression,
              t.booleanLiteral(capture),
            ]
          ),
        ],
      };
    }

    if (t.isIdentifier(path.node.expression)) {
      return {
        template: '',
        expressions: [
          t.callExpression(registerImport(path, 'addEventListener'), [
            nodeId,
            t.stringLiteral(eventName),
            path.node.expression,
            t.booleanLiteral(capture),
          ]),
        ],
      };
    }

    return {
      template: '',
      expressions: [],
    };
  }

  return {
    template: '',
    expressions: [],
  };
}

function canBeResolved(path: NodePath<t.JSXExpressionContainer>) {
  let handler = path.get('expression').node as t.Expression | null | undefined;
  while (t.isIdentifier(handler)) {
    const binding = path.scope.getBinding(handler.name);
    if (binding) {
      if (t.isVariableDeclarator(binding.path.node)) {
        handler = binding.path.node.init;
      } else if (t.isFunctionDeclaration(binding.path.node)) {
        return true;
      } else return false;
    } else return false;
  }
  return t.isFunction(handler);
}
