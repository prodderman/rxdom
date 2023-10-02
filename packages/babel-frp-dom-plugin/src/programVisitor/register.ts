/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NodePath } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
import * as t from '@babel/types';

import {
  Config,
  ImportStorage,
  JSXNodePath,
  RuntimeFn,
  TemplateStorage,
} from '../types';

export function registerTemplate(
  path: JSXNodePath,
  template: string
): t.Identifier {
  const programScope = path.scope.getProgramParent();
  const data: TemplateStorage = programScope.getData('templates');
  if (data.has(template)) {
    return t.cloneNode(data.get(template)!, true);
  }

  const id = path.scope.generateUidIdentifier('tmpl$');
  const templateDecl = t.variableDeclaration('const', [
    t.variableDeclarator(
      id,
      t.addComment(
        t.callExpression(registerImport(path, 'template'), [
          t.templateLiteral(
            [t.templateElement({ cooked: template, raw: template }, true)],
            []
          ),
        ]),
        'leading',
        '#__PURE__'
      )
    ),
  ]);

  const program = programScope.block as t.Program;
  const lastImportIdx = getIdxToInsertTemplate(program);
  program.body.splice(lastImportIdx, 0, templateDecl);
  data.set(template, id);

  return id;
}

export function registerImport(path: NodePath, fnName: RuntimeFn) {
  const program = path.scope.getProgramParent();
  const config: Config = program.getData('config');
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

function getIdxToInsertTemplate(program: t.Program) {
  let idx = 0;
  while (t.isImportDeclaration(program.body[idx])) {
    idx += 1;
  }

  return idx;
}
