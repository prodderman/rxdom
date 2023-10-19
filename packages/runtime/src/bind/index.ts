import type { Observer, Property } from '@frp-dom/reactive-core';
import { getCurrentContext, newContext, runInContext } from '../context';

export function bindProperty(child: Property<any>, effect: () => void) {
  const parentContext = getCurrentContext();
  const thisContext = newContext();

  const dispose = () => {
    if (thisContext.subscriptions.size > 0) {
      for (const subscription of thisContext.subscriptions) {
        thisContext.subscriptions.delete(subscription);
        subscription.unsubscribe();
      }
    }
  };

  let tickImmediately = false;
  const observer: Observer<any> = {
    next: () => {
      tickImmediately = true;
      dispose();
      runInContext(thisContext, effect, parentContext);
    },
  };

  const thisSubscription = child.subscribe(observer);
  thisSubscription.add(dispose);
  parentContext.subscriptions.add(thisSubscription);

  if (!tickImmediately) {
    runInContext(thisContext, effect, parentContext);
  }
}
