import { transact } from '@frp-dom/reactive-core';
import { renderQueue } from '../context';
import type { JSX } from '../jsx-runtime';

export function createComponent(
  Component: (props: object) => JSX.Element,
  props: object
) {
  return () => {
    const size = renderQueue.size;
    const result = transact(() => Component(props));

    if (size !== renderQueue.size) {
      console.error(
        `WARNING: State changed in "${Component.name}" while rendering`
      );
    }

    return result;
  };
}
