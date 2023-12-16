import type { JSX } from './jsx-runtime';
import { insert } from './insert';
import { createRootNode } from './core';

type Unmount = () => void;

export function mount(tree: JSX.Element, element: Element): Unmount {
  const dispose = createRootNode((context) => insert(context, element, tree));

  return () => {
    dispose();
    element.innerHTML = '';
  };
}
