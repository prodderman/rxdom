import type { JSX } from './jsx-runtime';
import { insert } from './insert';
import { disposeContext, renderQueue, runFlow, createContext } from './core';

type Unmount = () => void;

export function mount(tree: JSX.Element, element: Element): Unmount {
  const rootContext = createContext(false);
  renderQueue.set(
    (context) => insert(context, element, tree),
    [null, rootContext]
  );
  runFlow();

  return () => {
    disposeContext(rootContext, true);
    element.innerHTML = '';
  };
}
