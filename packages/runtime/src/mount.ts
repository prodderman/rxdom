import type { JSX } from './jsx-runtime';
import { insert } from './insert';
import { disposeContext, createContext } from './context';

type Unmount = () => void;

export function mount(tree: JSX.Element, element: Element): Unmount {
  const rootContext = createContext();
  insert(rootContext, element, tree);

  return () => {
    disposeContext(rootContext);
    element.innerHTML = '';
  };
}
