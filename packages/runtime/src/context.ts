import { Subscription } from '@frp-dom/reactive-core';

export interface Context {
  subscriptions: Set<Subscription>;
}

let context: Context | null = null;

export function newContext(): Context {
  return {
    subscriptions: new Set(),
    // effects: new WeakMap() // TODO: add Component's effects
  };
}

export function freeContext() {
  context = null;
}

export function runInContext(
  thisContext: Context,
  fn: () => void,
  prevContext: Context | null
) {
  context = thisContext;
  fn();
  context = prevContext;
}

export const getCurrentContext = () => {
  if (context === null) {
    throw new Error('TODO: what to do if it ran out of context?');
  }

  return context;
};
