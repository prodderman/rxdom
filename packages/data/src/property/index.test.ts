import { Atom } from '../index';
import { combine } from './index';

describe('combine', () => {
  it('emits notifications of middle node when someone get value before proxy notification', () => {
    const a = Atom.new(1);
    const b = combine('b', a, (a) => [a]);
    const c = combine('c', a, b, (v1, v2) => [v1, v2]);

    const cb1 = jest.fn();
    // subscribe and read value
    c.subscribe({
      next: () => {
        c.get();
      },
    });

    b.subscribe({
      next: cb1,
    });

    a.set(2);
    expect(cb1).toBeCalledTimes(1);
  });
});
