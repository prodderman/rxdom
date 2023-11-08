import { newSubject } from './index';
describe('subject', () => {
  it('should notify subscribers', () => {
    const subject = newSubject();
    const fn = jest.fn();

    const subscription = subject.subscribe({ next: fn });
    expect(fn).not.toHaveBeenCalled();

    subject.next(42);
    expect(fn).toHaveBeenNthCalledWith(1, 42);

    subject.next('foo');
    expect(fn).toHaveBeenNthCalledWith(2, 'foo');

    subscription.unsubscribe();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should not notify newcomer subscribers during notifying', () => {
    const subject = newSubject();
    const fn = jest.fn();

    subject.subscribe({ next: () => subject.subscribe({ next: fn }) });
    expect(fn).not.toHaveBeenCalled();

    subject.next(42);
    expect(fn).not.toHaveBeenCalled();
  });

  it('should not notify only once if next is called during notifying', () => {
    const sourceSubject = newSubject<void>();
    const childSubject1 = newSubject<void>();
    const childSubject2 = newSubject<void>();
    const childSubject3 = newSubject<void>();
    const mergedSubject = newSubject<void>();

    const next = jest.fn();

    mergedSubject.subscribe({ next });

    sourceSubject.subscribe({
      next: () => {
        childSubject1.next();
        childSubject2.next();
        childSubject3.next();
      },
    });

    childSubject1.subscribe({
      next: mergedSubject.next,
    });

    childSubject2.subscribe({
      next: mergedSubject.next,
    });

    childSubject3.subscribe({
      next: mergedSubject.next,
    });

    sourceSubject.next();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
