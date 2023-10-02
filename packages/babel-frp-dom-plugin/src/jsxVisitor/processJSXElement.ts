import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { VOID_ELEMENTS } from '../constants';
import { registerImport } from '../programVisitor';
import { JSXProcessResult, JSXAttributesResult } from '../types';
import {
  parseAttributeName,
  getTagName,
  isJSXAttributePath,
  isJSXExpressionContainerPath,
  unwrapFragment,
  uselessChildren,
} from '../utils';
import { evalExpression } from './processJSXExpression';
import { processNode } from './processNode';

export function processJSXElement(
  path: NodePath<t.JSXElement>
): JSXProcessResult {
  const tagName = getTagName(path.node);

  const isVoidTag = VOID_ELEMENTS.includes(tagName);
  const id = path.scope.generateUidIdentifierBasedOnNode(path.node, 'el$');
  const attributesResult = processTagAttributes(path, id);
  const attributesTemplate =
    attributesResult.attributes.length === 0
      ? ''
      : ' ' + attributesResult.attributes.join(' ');

  if (isVoidTag) {
    return {
      id,
      template: `<${tagName}${attributesTemplate}/>`,
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
        (acc, child, idx) => {
          if (child.id) {
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
    template: `<${tagName}${attributesTemplate}>${childrenTemplate}</${tagName}>`,
    declarations: declarations.concat(childrenDeclarations),
    expressions: attributesResult.expressions.concat(childrenExpressions),
  };
}

function processTagAttributes(
  path: NodePath<t.JSXElement>,
  nodeId: t.Identifier
): JSXAttributesResult {
  const attributes = path.get('openingElement').get('attributes');

  return attributes.reduce<JSXAttributesResult>(
    (acc, attr) => {
      if (isJSXAttributePath(attr)) {
        const pair = parseAttributeName(attr);
        const value = attr.get('value');

        if (pair[0].startsWith('on')) {
          const { attributes, expressions } = processAsEventHandler(
            nodeId,
            pair,
            value
          );
          acc.attributes.push(...attributes);
          acc.expressions.push(...expressions);
        } else {
          const { attributes, expressions } = processAsAttribute(
            nodeId,
            pair,
            value
          );
          acc.attributes.push(...attributes);
          acc.expressions.push(...expressions);
        }
      }

      return acc;
    },
    { attributes: [], expressions: [] }
  );
}

function processTagChildren(
  path: NodePath<t.JSXElement>,
  parentId: t.Identifier
): JSXProcessResult[] {
  return path
    .get('children')
    .flatMap(unwrapFragment)
    .filter(uselessChildren)
    .map((child, idx, children) => {
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
        attributes: [],
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
        attributes: [],
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
      attributes: [],
      expressions: [],
    };
  }

  return {
    attributes: [],
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

function processAsAttribute(
  nodeId: t.Identifier,
  [key]: [string, string?],
  value: NodePath<
    | t.StringLiteral
    | t.JSXElement
    | t.JSXFragment
    | t.JSXExpressionContainer
    | null
    | undefined
  >
): JSXAttributesResult {
  if (value.node === undefined || value.node === null) {
    return {
      attributes: [key],
      expressions: [],
    };
  }

  if (isJSXExpressionContainerPath(value)) {
    const evalResult = evalExpression(value);

    if (evalResult.type === 'void' || evalResult.type === 'empty') {
      return {
        attributes: [],
        expressions: [],
      };
    }

    if (evalResult.type === 'primitive') {
      return {
        attributes: [`${key}="${evalResult.value.toString()}"`],
        expressions: [],
      };
    }

    return {
      attributes: [],
      expressions: [
        t.callExpression(registerImport(value, 'setAttribute'), [
          nodeId,
          t.stringLiteral(key),
          evalResult.expression,
        ]),
      ],
    };
  }

  if (t.isStringLiteral(value.node)) {
    return {
      attributes: [`${key}="${value.node.value}"`],
      expressions: [],
    };
  }

  return {
    attributes: [],
    expressions: [],
  };
}
