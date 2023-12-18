import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { VOID_ELEMENTS } from '../constants';
import { registerImport } from '../program';
import { JSXProcessResult, JSXAttributesResult } from '../types';
import {
  getTagName,
  isJSXAttributePath,
  unwrapFragment,
  isChildUseless,
  isJSXSpreadAttributePath,
} from '../utils';

import { processNode } from './processNode';
import {
  isEventHandler,
  parseAttribute,
  parseAttributeName,
  parseEventHandler,
} from '../attributes';
import { parseRef } from '../attributes/ref';

export function processJSXElement(
  path: NodePath<t.JSXElement>
): JSXProcessResult {
  const tagName = getTagName(path.node);

  const isVoidTag = VOID_ELEMENTS.includes(tagName);
  const id = path.scope.generateUidIdentifierBasedOnNode(path.node, 'el$');
  const attributesResult = processAttributes(path, id);

  if (isVoidTag) {
    return {
      id,
      template: `<${tagName}${attributesResult.template}/>`,
      declarations: [],
      expressions: attributesResult.expressions,
    };
  }

  const childrenResults = processChildren(path, id);

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

function processChildren(
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

function processAttributes(
  path: NodePath<t.JSXElement>,
  nodeId: t.Identifier
): JSXAttributesResult {
  const attributes = path.get('openingElement').get('attributes');
  const spreads = attributes.filter(isJSXSpreadAttributePath);
  const singleAttributes = attributes.filter(isJSXAttributePath);

  // <div {...spread} />
  if (spreads.length === 1 && singleAttributes.length === 0) {
    const spreadAttributesExpression = t.callExpression(
      registerImport(path, 'spreadAttributes'),
      [t.identifier('context'), nodeId, spreads[0].node.argument]
    );

    return {
      template: '',
      expressions: [spreadAttributesExpression],
    };
  }

  // <div id="root" {...spread1} class={atom} {...spread2}>
  if (spreads.length > 0) {
    let template = '';
    const objectProperties: (t.ObjectProperty | t.SpreadElement)[] = [];

    for (const attributePath of attributes) {
      if (isJSXAttributePath(attributePath)) {
        const parsedName = parseAttributeName(attributePath);
        const value = attributePath.get('value');

        const result = isEventHandler(parsedName.name)
          ? parseEventHandler(parsedName, value)
          : parseAttribute(parsedName, value);

        if (result.template !== '') {
          template += ' ' + result.template;
        }

        if (result.expression) {
          objectProperties.push(
            t.objectProperty(t.stringLiteral(result.key), result.expression)
          );
        }
      } else if (isJSXSpreadAttributePath(attributePath)) {
        objectProperties.push(t.spreadElement(attributePath.node.argument));
      }
    }

    const spreadAttributesExpression = t.callExpression(
      registerImport(path, 'spreadAttributes'),
      [t.identifier('context'), nodeId, t.objectExpression(objectProperties)]
    );

    return {
      template,
      expressions: [spreadAttributesExpression],
    };
  }

  let template = '';
  const expressions: t.Expression[] = [];
  for (const attributePath of singleAttributes) {
    const parsedName = parseAttributeName(attributePath);
    const value = attributePath.get('value');

    if (isEventHandler(parsedName.name)) {
      const result = parseEventHandler(parsedName, value);

      if (result.template !== '') {
        template += ' ' + result.template;
      }

      if (result.handler && result.expression) {
        if (result.handler.resolved) {
          expressions.push(
            t.callExpression(
              t.memberExpression(nodeId, t.identifier('addEventListener')),
              [
                t.stringLiteral(result.handler.eventName),
                result.expression,
                t.booleanLiteral(result.handler.capture),
              ]
            )
          );
        } else {
          expressions.push(
            t.callExpression(registerImport(path, 'setEventListener'), [
              t.identifier('context'),
              nodeId,
              t.stringLiteral(result.handler.eventName),
              result.expression,
              t.booleanLiteral(result.handler.capture),
            ])
          );
        }
      }
    } else if (parsedName.name === 'ref') {
      const identifier = parseRef(parsedName, value);

      if (identifier) {
        const testExpression = t.binaryExpression(
          '===',
          t.unaryExpression('typeof', identifier),
          t.stringLiteral('function')
        );

        const assignmentExpression = t.assignmentExpression(
          '=',
          t.memberExpression(identifier, t.identifier('current')),
          nodeId
        );
        expressions.push(
          t.conditionalExpression(
            testExpression,
            t.callExpression(identifier, [nodeId]),
            assignmentExpression
          )
        );
      }
    } else {
      const result = parseAttribute(parsedName, value);

      if (result.template !== '') {
        template += ' ' + result.template;
      }

      if (result.expression) {
        if (parsedName.name === 'style') {
          expressions.push(
            t.callExpression(registerImport(attributePath, 'setStyle'), [
              nodeId,
              result.expression,
            ])
          );
        } else if (
          parsedName.name === 'class' ||
          parsedName.name === 'className'
        ) {
          expressions.push(
            t.callExpression(registerImport(attributePath, 'setClass'), [
              nodeId,
              result.expression,
            ])
          );
        } else if (parsedName.name === 'value') {
          expressions.push(
            t.callExpression(registerImport(attributePath, 'setValue'), [
              nodeId,
              result.expression,
            ])
          );
        } else {
          expressions.push(
            t.callExpression(registerImport(attributePath, 'setAttribute'), [
              nodeId,
              t.stringLiteral(result.key),
              result.expression,
            ])
          );
        }
      }
    }
  }

  return {
    template,
    expressions,
  };
}
