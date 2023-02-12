export * from './runtime';
export type { JSX } from './jsx-runtime/jsx';

import type { JSX } from './jsx-runtime/jsx';
import { insert, MountableElement } from './runtime';

export function render(
  code: () => JSX.Element,
  element: MountableElement,
  init?: any,
  options = {}
) {
  return insert(element, code());
}
