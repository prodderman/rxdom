import type { Subscription } from '@frp-dom/reactive-core';

export interface Context {
  subscriptions: Set<Subscription>;
}

export function newContext(): Context {
  return {
    subscriptions: new Set(),
    // effects: new WeakMap() // TODO: add Component's effects
  };
}

let context: Context = newContext();
const rootContext = context;

export function runInContext(
  thisContext: Context,
  fn: () => void,
  prevContext: Context
) {
  context = thisContext;
  fn();
  context = prevContext;
}

export function disposeRoot() {
  for (const subscription of rootContext.subscriptions) {
    rootContext.subscriptions.delete(subscription);
    subscription.unsubscribe();
  }
}

export const getCurrentContext = () => {
  return context;
};
