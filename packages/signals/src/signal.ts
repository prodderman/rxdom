import { now, Tick } from './clock';
import { mkEmitter } from './emitter';
import { property } from './property';

import type { Observer } from './observable';
import type { Property } from './property';

export type Update<T> = (value: T) => T;

export interface Signal<T> extends Property<T> {
  readonly set: (value: T) => void;
  readonly modify: (...updates: Update<T>[]) => void;
}

export const signal = <T>(initial: T): Signal<T> => {
  let lastValue = initial;
  const emitter = mkEmitter();
  const get = () => lastValue;
  const set = (value: T) => {
    if (value !== lastValue) {
      lastValue = value;
      emitter.next(now());
    }
  };
  const modify = (...updates: Update<T>[]) => {
    let value = lastValue;
    for (const update of updates) {
      value = update(value);
    }

    set(value);
  };

  const subscribe = (observer: Observer<Tick>) => emitter.subscribe(observer);

  return {
    ...property(get, subscribe),
    modify,
    set,
  };
};
