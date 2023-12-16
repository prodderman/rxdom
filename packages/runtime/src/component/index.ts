import {
  batch,
  observableNever,
  observerNever,
  subscribeOn,
} from '@frp-dom/reactive-core';
import {
  Context,
  continueWithContext,
  disposeContext,
  effectScheduler,
} from '../core';
import type { JSX } from '../jsx-runtime';
import { isEffectful } from '../effect';

export function createComponent(
  Component: (props: object) => JSX.Element,
  props: object
) {
  return (parentContext: Context) => {
    const result = batch(() => Component(props));

    if (isEffectful(result)) {
      if (result[1] === observableNever) {
        return continueWithContext(parentContext, result[0]);
      }

      const thisContext: Context = new Set();

      const subscription = subscribeOn(result[1], effectScheduler).subscribe(
        observerNever
      );

      parentContext.add(() => {
        disposeContext(thisContext);
        subscription.unsubscribe();
      });

      return continueWithContext(thisContext, result[0]);
    }

    return continueWithContext(parentContext, result);
  };
}
