import {
  Observable,
  subscriptionNever,
  merge,
  subscribeOn,
  observerNever,
} from '@frp-dom/reactive-core';
import {
  Context,
  Effect,
  continueWithContext,
  createContext,
  effectScheduler,
} from '../core';

const effectfulSymbol = Symbol('effectful');

export type effectfulSymbol = typeof effectfulSymbol;

export type Effectful<T> = [T, Effect];

export function withEffect<T>(
  value: T,
  ...effects: Observable<void>[]
): Effectful<T> {
  return {
    0: value,
    1: merge(effects),
    [effectfulSymbol]: void 0,
  } as never as Effectful<T>;
}

export function effect(
  effectFn: (() => void) | (() => () => void)
): Observable<void> {
  return {
    subscribe() {
      const unsubscribe = effectFn();
      return unsubscribe ? { unsubscribe } : subscriptionNever;
    },
  };
}

export function createEffectfulNode(
  parentContext: Context,
  effectful: Effectful<unknown>
) {
  const thisContext = createContext(false, parentContext);
  thisContext.disposer = subscribeOn(effectful[1], effectScheduler).subscribe(
    observerNever
  );

  return continueWithContext(thisContext, effectful[0]);
}

export function isEffectful(entity: any): entity is Effectful<unknown> {
  return (
    typeof entity === 'object' && entity !== null && effectfulSymbol in entity
  );
}
