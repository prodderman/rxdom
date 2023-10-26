import { create } from './index';
describe('subject', () => {
  it('', () => {
    const newSubject = create();
    const teardownFn = jest.fn();
    const observerFn = jest.fn(() => teardownFn);

    const subscription = newSubject.subscribe({ next: observerFn });
    expect(observerFn).not.toHaveBeenCalled();
    expect(teardownFn).not.toHaveBeenCalled();

    newSubject.next();
    expect(observerFn).toHaveBeenCalledTimes(1);
    expect(teardownFn).not.toHaveBeenCalled();

    newSubject.next();
    expect(observerFn).toHaveBeenCalledTimes(2);
    expect(teardownFn).toHaveBeenCalledTimes(1);

    subscription.unsubscribe();
    expect(observerFn).toHaveBeenCalledTimes(2);
    expect(teardownFn).toHaveBeenCalledTimes(2);
  });
});
