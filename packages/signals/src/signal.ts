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

export const signal = <T>(value: T): Signal<T> => {
  const emitter = mkEmitter();
  const get = () => value;
  const set = (newValue: T) => {
    if (value !== newValue) {
      value = newValue;
      emitter.next(now());
    }
  };
  const modify = (...updates: Update<T>[]) => {
    let buffer = value;
    for (const update of updates) {
      buffer = update(value);
    }

    set(buffer);
  };

  const subscribe = (observer: Observer<Tick>) => emitter.subscribe(observer);

  return {
    ...property(get, subscribe),
    modify,
    set,
  };
};
