import { newScheduler } from './index';
describe('scheduler', () => {
  it('should notify subscribers', () => {
    const scheduler = newScheduler(true);
    const fn = jest.fn();

    const subscription = scheduler.subscribe({ next: fn });
    expect(fn).not.toHaveBeenCalled();

    scheduler.next(42);
    expect(fn).toHaveBeenNthCalledWith(1, 42);

    scheduler.next('foo');
    expect(fn).toHaveBeenNthCalledWith(2, 'foo');

    subscription.unsubscribe();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not notify newcomer subscribers during notifying', () => {
    const scheduler = newScheduler(true);
    const fn = jest.fn();

    scheduler.subscribe({ next: () => scheduler.subscribe({ next: fn }) });
    expect(fn).not.toHaveBeenCalled();

    scheduler.next(42);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should notify only if it is a source', () => {
    const nonSourceScheduler = newScheduler(false);
    const nonSourceObserverFn = jest.fn();

    nonSourceScheduler.subscribe({ next: nonSourceObserverFn });
    nonSourceScheduler.next(42);
    expect(nonSourceObserverFn).not.toHaveBeenCalled();

    const sourceScheduler = newScheduler(true);
    const sourceObserverFn = jest.fn();

    sourceScheduler.subscribe({ next: sourceObserverFn });
    sourceScheduler.next(42);
    expect(sourceObserverFn).toHaveBeenCalledTimes(1);
  });

  it('should notify only once if next is called during notifying', () => {
    const sourceScheduler = newScheduler<void>(true);
    const childScheduler1 = newScheduler<void>();
    const childScheduler2 = newScheduler<void>();
    const childScheduler3 = newScheduler<void>();
    const mergedScheduler = newScheduler<void>();

    const next = jest.fn();

    mergedScheduler.subscribe({ next });

    sourceScheduler.subscribe({
      next: () => {
        childScheduler1.next();
        childScheduler2.next();
        childScheduler3.next();
      },
    });

    childScheduler1.subscribe({
      next: mergedScheduler.next,
    });

    childScheduler2.subscribe({
      next: mergedScheduler.next,
    });

    childScheduler3.subscribe({
      next: mergedScheduler.next,
    });

    sourceScheduler.next();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
