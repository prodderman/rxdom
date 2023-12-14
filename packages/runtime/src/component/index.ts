import { batch } from '@frp-dom/reactive-core';
import { Context, continueWithContext, DOMUpdatesQueue } from '../core';
import type { JSX } from '../jsx-runtime';
import { isEffectful, createEffectfulNode } from '../effect';

export function createComponent(
  Component: (props: object) => JSX.Element,
  props: object
) {
  return (parentContext: Context) => {
    const queueSizeBeforeRender = DOMUpdatesQueue.size;
    const result = batch(() => Component(props));

    if (queueSizeBeforeRender !== DOMUpdatesQueue.size) {
      console.error(
        `WARNING: State changed in "${Component.name}" while rendering`
      );
    }
    if (isEffectful(result)) {
      return createEffectfulNode(parentContext, result);
    }

    return continueWithContext(parentContext, result);
  };
}
