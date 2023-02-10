import { NodePath } from '@babel/core';
import * as t from '@babel/types';

import { VOID_ELEMENTS } from '../constants';
import { registerImport } from '../programVisitor';
import {
  JSXChildren,
  ProcessContext,
  JSXProcessResult,
  JSXAttributesResult,
} from '../types';
import { convertComponentIdentifier, getTagName, isComponent } from '../utils';
import { processNode } from './processNode';
import { processText } from './processText';

export function processJSXElement(
  path: NodePath<t.JSXElement>,
  context: ProcessContext
): JSXProcessResult {
  const tagName = getTagName(path.node);

  if (isComponent(tagName)) {
    return processComponent(path, context);
  }

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

function processComponent(
  path: NodePath<t.JSXElement>,
  context: ProcessContext
): JSXProcessResult {
  const componentName = convertComponentIdentifier(
    path.node.openingElement.name
  );

  const childrenResults = processArrayChildren(path);

  const props =
    childrenResults.length > 0
      ? t.objectExpression([
          t.objectMethod(
            'get',
            t.stringLiteral('children'),
            [],
            t.blockStatement([
              t.returnStatement(
                childrenResults.length === 1
                  ? childrenResults[0]
                  : t.arrayExpression(childrenResults)
              ),
            ])
          ),
        ])
      : t.objectExpression([]);

  const createComponentExpr = t.callExpression(
    registerImport(path, 'createComponent'),
    [componentName, props]
  );

  return {
    id: !context.skipId
      ? path.scope.generateUidIdentifierBasedOnNode(path.node)
      : null,
    expressions: [createComponentExpr],
    declarations: [],
    template: context.parentId ? '<!>' : '',
  };
}

export function processArrayChildren(
  path: NodePath<t.JSXElement | t.JSXFragment>
): t.Expression[] {
  return path
    .get('children')
    .filter(uselessChildren)
    .map((child) => {
      if (t.isJSXText(child.node)) {
        return t.stringLiteral(processText(child.node));
      }

      if (t.isJSXExpressionContainer(child.node)) {
        return child.node.expression as t.Expression;
      }

      if (t.isJSXSpreadChild(child.node)) {
        return child.node.expression;
      }

      return child.node;
    });
}

function processTagChildren(
  path: NodePath<t.JSXElement>,
  parentId: t.Identifier
): JSXProcessResult[] {
  return path
    .get('children')
    .filter(uselessChildren)
    .map((child, _, children) =>
      processNode(child, {
        parentId,
        skipId: children.length === 1,
      })
    );
}

function processTagAttributes(
  path: NodePath<t.JSXElement>,
  elementId: t.Identifier
): JSXAttributesResult {
  const attributes = path.get('openingElement').get('attributes');

  return attributes.reduce<JSXAttributesResult>(
    (acc, attribute) => {
      const node = attribute.node;
      if (t.isJSXAttribute(node)) {
        if (node.value === undefined) {
          acc.attributes.push(`${node.name.name}`);
        } else if (
          t.isJSXExpressionContainer(node.value) &&
          !t.isJSXEmptyExpression(node.value.expression)
        ) {
          const valuePath = (attribute as NodePath<t.JSXAttribute>).get(
            'value'
          ) as NodePath<t.JSXExpressionContainer>;
          const evalResult = valuePath.get('expression').evaluate();
          if (
            evalResult.confident &&
            (evalResult.value !== undefined || evalResult.value !== null)
          ) {
            acc.attributes.push(`${node.name.name}="${evalResult.value}"`);
          } else {
            acc.expressions.push(
              t.callExpression(registerImport(path, 'setAttribute'), [
                elementId,
                t.stringLiteral(node.name.name.toString()),
                node.value.expression,
              ])
            );
          }
        } else if (t.isStringLiteral(node.value)) {
          acc.attributes.push(`${node.name.name}="${node.value.value}"`);
        }
      }

      return acc;
    },
    { attributes: [], expressions: [] }
  );
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
