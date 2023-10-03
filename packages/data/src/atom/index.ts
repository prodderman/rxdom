import { Property, $, PropertyMeta } from '@frp-dom/reactive-core';
import { Subject } from '../subject';

export interface Atom<A> extends Property<A> {
  set(value: A): void;
  modify(fn: (value: A) => A): void;
}

export function create<A>(
  value: A,
  name = 'anonym atom',
  compare: (a: A, b: A) => boolean = Object.is
): Atom<A> {
  const subject = Subject.new<A>(name);

  const set = (newValue: A): void => {
    if (!compare(newValue, value)) {
      value = newValue;
      subject.next(value);
    }
  };

  const modify = (update: (value: A) => A): void => {
    set(update(value));
  };

  const get = () => value;

  const getMeta = (): PropertyMeta => ({
    name,
    observers: subject.meta.observers,
  });

  return Object.assign($(get, subject.subscribe, getMeta), { set, modify });
}

export const Atom = {
  new: create,
};
