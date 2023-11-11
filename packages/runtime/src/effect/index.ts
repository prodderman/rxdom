import { Observable, subscriptionNever, merge } from '@frp-dom/reactive-core';
import { Effect } from '../core';

const effectfulSymbol = Symbol('');

export type Effectful = {
  0: any;
  1: Effect;
  [effectfulSymbol]: void;
};

export function withEffect(
  value: any,
  ...effects: Observable<void>[]
): Effectful {
  return {
    0: value,
    1: merge(effects),
    [effectfulSymbol]: void 0,
  };
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

export function isEffectful(entity: any): entity is Effectful {
  return (
    typeof entity === 'object' && entity !== null && effectfulSymbol in entity
  );
}
