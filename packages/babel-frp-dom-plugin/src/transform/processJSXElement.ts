import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { VOID_ELEMENTS } from '../constants';
import { registerImport } from '../programVisitor';
import {
  JSXChildren,
  ProcessContext,
  JSXElementResult,
  JSXChildrenResult,
} from '../types';
import { getTagName } from '../utils';
import { processNode } from './processNode';

export function processJSXElement(
  path: NodePath<t.JSXElement>,
  context: ProcessContext
): JSXElementResult {
  const tagName = getTagName(path.node);
  const isVoidTag = VOID_ELEMENTS.includes(tagName);
  const attributes = processAttributes(path);
  const id = path.scope.generateUidIdentifierBasedOnNode(path.node, 'el$');

  if (isVoidTag) {
    return {
      kind: 'jsx',
      id,
      template: `<${tagName}${attributes}/>`,
      statements: [],
    };
  }

  const childrenResults = processChildren(path, { parentId: id });

  const childrenTemplate = childrenResults
    .map((child) => child.template)
    .join('');

  const childrenStatements = childrenResults.flatMap(
    (child) => child.statements
  );

  const needToFindElement = childrenStatements.length > 0;
  const statements = needToFindElement
    ? childrenResults.reduce<{
        statements: t.Statement[];
        prevId: t.Identifier;
      }>(
        (acc, child, idx) => {
          if (child.id) {
            acc.statements.push(
              t.variableDeclaration('const', [
                t.variableDeclarator(
                  child.id,
                  t.memberExpression(
                    acc.prevId,
                    t.identifier(idx === 0 ? 'firstChild' : 'nextSibling')
                  )
                ),
              ])
            );
            acc.prevId = child.id;
          }
          return acc;
        },

        { statements: [], prevId: id }
      ).statements
    : [];

  return {
    kind: 'jsx',
    id,
    template: `<${tagName}${attributes}>${childrenTemplate}</${tagName}>`,
    statements: [...statements, ...childrenStatements],
  };
}

function processChildren(
  path: NodePath<t.JSXElement>,
  context: ProcessContext
): JSXChildrenResult[] {
  return path
    .get('children')
    .filter(uselessChildren)
    .map((child, _, children) => {
      const transformedResult = processNode(child, {
        parentId: context.parentId,
        skipId: children.length === 1,
      });

      const result: JSXChildrenResult = {
        id: transformedResult.id,
        template: transformedResult.template,
        statements: [],
      };

      if (transformedResult.kind === 'jsx') {
        result.statements.push(...transformedResult.statements);
      }

      if (
        transformedResult.kind === 'expression' &&
        context.parentId &&
        transformedResult.expression
      ) {
        const needReplace = transformedResult.id ? [transformedResult.id] : [];
        result.statements.push(
          t.expressionStatement(
            t.callExpression(registerImport(path, 'insert'), [
              context.parentId,
              transformedResult.expression,
              ...needReplace,
            ])
          )
        );
      }

      return result;
    });
}

function processAttributes(path: NodePath<t.JSXElement>) {
  return '';
}

function uselessChildren(child: NodePath<JSXChildren>) {
  return (
    !(
      t.isJSXExpressionContainer(child.node) &&
      t.isJSXEmptyExpression(child.node.expression)
    ) &&
    (!t.isJSXText(child.node) ||
      !/^[\r\n\s]*$/.test((child.node.extra?.raw as string) ?? ''))
  );
}
