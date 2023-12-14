import type { JSX } from './jsx-runtime';
import { insert } from './insert';
import { disposeContext, createContext, reflowScheduler } from './core';

type Unmount = () => void;

export function mount(tree: JSX.Element, element: Element): Unmount {
  const rootContext = createContext(false, null);
  reflowScheduler.schedule(() => insert(rootContext, element, tree));

  return () => {
    disposeContext(rootContext, true);
    element.innerHTML = '';
  };
}
