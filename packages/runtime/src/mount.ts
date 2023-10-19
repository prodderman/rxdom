import type { JSX } from './jsx-runtime';
import { insert } from './insert';

type Unmount = () => void;

export function mount(tree: JSX.Element, element: Element): Unmount {
  insert(element, tree);

  return () => {
    element.innerHTML = '';
  };
}
