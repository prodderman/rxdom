import { transact } from '@frp-dom/reactive-core';
import { renderQueue } from '../core';
import type { JSX } from '../jsx-runtime';

export function createComponent(
  Component: (props: object) => JSX.Element,
  props: object
) {
  return () => {
    const queueSizeBeforeRender = renderQueue.size;
    const result = transact(() => Component(props));

    if (queueSizeBeforeRender !== renderQueue.size) {
      console.error(
        `WARNING: State changed in "${Component.name}" while rendering`
      );
    }

    return result;
  };
}
