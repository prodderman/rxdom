import { Property, newProperty } from '@frp-dom/reactive-core';

export interface Atom<A> extends Property<A> {
  set(value: A): void;
  modify(fn: (value: A) => A): void;
}

export const create = <A>(value: A, name?: string): Atom<A> =>
  newProperty((observer) => {
    const set = (newValue: A): void => {
      if (newValue !== value) {
        value = newValue;
        observer.next(value);
      }
    };

    const modify = (update: (value: A) => A): void => {
      set(update(value));
    };

    const get = () => value;

    return {
      name,
      get,
      set,
      modify,
    };
  });

export const Atom = {
  new: create,
};
