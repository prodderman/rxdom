import { Property, newScheduler, newProperty } from '@frp-dom/reactive-core';

export interface Atom<A> extends Property<A> {
  set(value: A): void;
  modify(fn: (value: A) => A): void;
  get value(): A;
  set value(v: A);
  get observers(): number;
}

export function create<A>(value: A): Atom<A> {
  const subject = newScheduler<A>(true);

  const set = (newValue: A): void => {
    if (value !== newValue) {
      value = newValue;
      subject.next(newValue);
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
      get observers() {
        return subject.observers;
      },
      set,
      modify,
    },
    newProperty(
      () => value,
      (observer) => {
        let lastValue = value;
        return subject.subscribe({
          next: () => {
            if (lastValue !== value) {
              observer.next((lastValue = value));
            }
          },
        });
      }
    )
  );
}

export const Atom = {
  new: create,
};
