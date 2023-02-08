import * as t from '@babel/types';
import type { NodePath, PluginPass } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';

import { getTagName } from './shared/utils';
import { Result, RuntimeFn, JSXNodePath, ImportStorage, Config } from './types';
import { VOID_ELEMENTS } from './constants';

export function transformJSX(path: JSXNodePath, state: PluginPass) {
  const result = transformNode(path);
  registerTemplate(path, state, result);

  path.replaceWith(
    t.callExpression(
      t.memberExpression(t.identifier('test'), t.identifier('cloneNode')),
      [t.booleanLiteral(true)]
    )
  );
}

export function transformNode(path: NodePath) {
  if (t.isJSXElement(path.node)) {
    return transformJSXElement(path as NodePath<t.JSXElement>);
  }

  throw Error('unexpected element type');
}

function transformJSXElement(path: NodePath<t.JSXElement>): Result {
  const tagName = getTagName(path.node);
  const isVoidTag = VOID_ELEMENTS.includes(tagName);
  const state: Result = {
    id: path.scope.generateUidIdentifier('el$'),
    template: `<${tagName}`,
    tagName,
  };

  state.template += isVoidTag ? '/>' : '>';

  if (!isVoidTag) {
    const children = path
      .get('children')
      .filter((child) => t.isJSXElement(child))
      .map(transformNode)
      .forEach((child) => (state.template += child.template));
    state.template += `</${tagName}>`;
  }

  return state;
}

/**
 *
 * Write top level jsx templates to the Program scope to append them later to the top of the file
 */

function registerTemplate(
  path: JSXNodePath,
  state: PluginPass,
  result: Result
) {
  const program = path.scope.getProgramParent();
  const templateDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      path.scope.generateUidIdentifier('$tmpl'),
      t.addComment(
        t.callExpression(appendImport(path, state, 'template'), [
          t.templateLiteral(
            [
              t.templateElement(
                { cooked: result.template, raw: result.template },
                true
              ),
            ],
            []
          ),
          t.numericLiteral(result.template.split('<').length - 1),
        ]),
        'leading',
        '#__PURE__'
      )
    ),
  ]);

  const data = program.getData('templates');
  data.unshift(templateDecl);
}

function appendImport(path: JSXNodePath, state: PluginPass, fnName: RuntimeFn) {
  const program = path.scope.getProgramParent();
  const config = state.opts as Config;
  const data: ImportStorage = program.getData('imports');

  if (data.has(fnName)) {
    return t.cloneNode(data.get(fnName)!, true);
  }

  const id = addNamed(path, fnName, config.moduleName, {
    nameHint: `$${fnName}`,
  });
  data.set(fnName, id);
  return id;
}
