import * as t from '@babel/types';
import type { NodePath, PluginPass } from '@babel/core';
// import { HubInterface } from '@babel/traverse'

// import { transformElement as transformElementDOM } from '../dom/element';
// import { createTemplate as createTemplateDOM } from '../dom/template';
// import { transformElement as transformElementSSR } from '../ssr/element';
// import { createTemplate as createTemplateSSR } from '../ssr/template';
// import { transformElement as transformElementUniversal } from '../universal/element';
// import { createTemplate as createTemplateUniversal } from '../universal/template';
import {
  getTagName,
  isComponent,
  isDynamic,
  trimWhitespace,
  transformCondition,
  getStaticExpression,
  escapeHTML,
  getConfig,
  escapeBackticks,
} from './shared/utils';
import { Results } from './shared/types';
import { VOID_ELEMENTS } from './constants';

// import transformComponent from './component';
// import transformFragmentChildren from './fragment';

type State = {
  id: t.Identifier;
  template: string;
  tagName: string;
};

type Template = {
  id: t.Identifier;
  template: string;
  elementCount: number;
};

export function transformJSX(
  path: NodePath<t.JSXElement> | NodePath<t.JSXFragment>
) {
  const state = transformNode(path);
  registerTemplate(path, state);
  const template = createTemplate(path, state);

  path.replaceWith(
    t.callExpression(
      t.memberExpression(
        path.scope.generateUidIdentifier('_$tmpl'),
        t.identifier('cloneNode')
      ),
      [t.booleanLiteral(true)]
    )
  );
}

export function transformNode(path: NodePath) {
  if (t.isJSXElement(path.node)) {
    return transformElement(path as NodePath<t.JSXElement>);
  }

  throw Error('unexpected element');
}

function transformElement(path: NodePath<t.JSXElement>): State {
  const tagName = getTagName(path.node);
  const isVoidTag = VOID_ELEMENTS.includes(tagName);
  const state: State = {
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

function createTemplate(path: NodePath, result: State): t.Node {
  return t.callExpression(
    t.arrowFunctionExpression(
      [],
      t.blockStatement([t.returnStatement(result.id)])
    ),
    []
  );
}

function registerTemplate(path: NodePath, state: State) {
  const program = path.scope.getProgramParent();
  const data = program.getData('templates') ?? [];
  const template = t.variableDeclaration('const', [
    t.variableDeclarator(
      path.scope.generateUidIdentifier('_tmpl$'),
      t.addComment(
        t.callExpression(t.identifier('_template$'), [
          t.templateLiteral(
            [
              t.templateElement(
                { cooked: state.template, raw: state.template },
                false
              ),
            ],
            []
          ),
          t.numericLiteral(state.template.split('<').length - 1),
        ]),
        'leading',
        '#__PURE__'
      )
    ),
  ]);
  data.push(template);
  program.setData('templates', data);
}

// function registerTemplate(path, results) {
//   let decl;
//   if (results.template.length) {
//     let templateDef, templateId;
//     if (!results.skipTemplate) {
//       const templates =
//         path.scope.getProgramParent().data.templates ||
//         (path.scope.getProgramParent().data.templates = []);
//       if (
//         (templateDef = templates.find((t) => t.template === results.template))
//       ) {
//         templateId = templateDef.id;
//       } else {
//         templateId = path.scope.generateUidIdentifier('tmpl$');
//         templates.push({
//           id: templateId,
//           template: results.template,
//           elementCount: results.template.split('<').length - 1,
//           isSVG: results.isSVG,
//           renderer: 'dom',
//         });
//       }
//     }
//     decl = t.variableDeclarator(
//       results.id,
//       hydratable
//         ? t.callExpression(
//             registerImportMethod(
//               path,
//               'getNextElement',
//               getRendererConfig(path, 'dom').moduleName
//             ),
//             templateId ? [templateId] : []
//           )
//         : results.hasCustomElement
//         ? t.callExpression(
//             registerImportMethod(
//               path,
//               'untrack',
//               getRendererConfig(path, 'dom').moduleName
//             ),
//             [
//               t.arrowFunctionExpression(
//                 [],
//                 t.callExpression(
//                   t.memberExpression(
//                     t.identifier('document'),
//                     t.identifier('importNode')
//                   ),
//                   [templateId, t.booleanLiteral(true)]
//                 )
//               ),
//             ]
//           )
//         : t.callExpression(
//             t.memberExpression(templateId, t.identifier('cloneNode')),
//             [t.booleanLiteral(true)]
//           )
//     );
//   }
//   results.decl.unshift(decl);
//   results.decl = t.variableDeclaration('const', results.decl);
// }
