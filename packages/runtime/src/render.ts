import type { JSX } from './jsx-runtime';
import { newContext, runInContext } from './context';
import { insert } from './insert';

type Dispose = () => void;

export function render(tree: () => JSX.Element, element: Element): Dispose {
  const rootContext = newContext();
  runInContext(rootContext, () => insert(element, tree()), null);

  return () => {
    for (const subscription of rootContext.subscriptions)
      subscription.unsubscribe();
    rootContext.subscriptions.clear();
    element.innerHTML = '';
  };
}
