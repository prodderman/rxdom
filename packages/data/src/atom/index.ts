import { Property } from '../property';
import { Subject } from '../subject';

export interface Atom<A> extends Property<A> {
  set(value: A): void;
  modify(fn: (value: A) => A): void;
}

export function create<A>(
  name: string,
  value: A,
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

  return {
    set,
    modify,
    ...Property.from(name, get, () => subject.observers, subject.subscribe),
  };
}

export const Atom = {
  new: create,
};
