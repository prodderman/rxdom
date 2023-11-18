import { Observable, subscriptionNever, merge } from '@frp-dom/reactive-core';
import { Effect } from '../core';

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

export function isEffectful(entity: any): entity is Effectful<unknown> {
  return (
    typeof entity === 'object' && entity !== null && effectfulSymbol in entity
  );
}
