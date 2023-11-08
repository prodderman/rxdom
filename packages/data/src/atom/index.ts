import { Property, newSubject, newProperty } from '@frp-dom/reactive-core';

export interface Atom<A> extends Property<A> {
  value: A;
  set(value: A): void;
  modify(fn: (value: A) => A): void;
}

export function create<A>(value: A): Atom<A> {
  const subject = newSubject<A>(true, value);

  const set = (newValue: A): void => {
    if (newValue !== value) {
      value = newValue;
      subject.next(value);
    }
  };

  const modify = (update: (value: A) => A): void => {
    set(update(value));
  };

  return Object.assign(
    {
      get value() {
        return value;
      },
      set value(newValue: A) {
        set(newValue);
      },
      set,
      modify,
    },
    newProperty(() => value, subject.subscribe)
  );
}

export const Atom = {
  new: create,
};
