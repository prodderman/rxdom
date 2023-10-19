import { JSXProcessResult, JSXNodePath } from '../types';
import { createReplacementNode } from './createReplacmetNode';
import { processNode } from './processNode';

export function transformJSX(path: JSXNodePath) {
  const processResult = processNode(path, {});
  const replacementNode = createReplacementNode(
    path,
    processResult as JSXProcessResult
  );

  if (replacementNode !== path.node) {
    path.replaceWith(replacementNode);
  }
}
