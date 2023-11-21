import {
  Observable,
  Property,
  Subscription,
  observerNever,
  transact,
} from '@frp-dom/reactive-core';

export type Effect = Observable<never>;

export type Context = {
  property: boolean;
  disposer?: Subscription;
  children?: Set<Context>;
};

export function createContext(property: boolean): Context {
  return {
    property,
  };
}

let isUpdating = false;
const disposeQueue = new Set<Context>();
const effectsQueue = new Map<Context, Effect>();
export const renderQueue = new Map<
  (context: Context) => any,
  [Context | null, Context]
>();

export function createReactiveNode(
  parentContext: Context,
  property: Observable<unknown>,
  render: (context: Context) => any
) {
  const thisContext = createContext(true);
  (parentContext.children ??= new Set()).add(thisContext);

  let subscribing = true;
  thisContext.disposer = property.subscribe({
    next: () => {
      if (subscribing) return;
      disposeQueue.add(thisContext);
      renderQueue.set(render, [parentContext, thisContext]);
      runFlow();
    },
  });
  subscribing = false;

  return render(thisContext);
}

export function createEffectfulNode(
  parentContext: Context,
  effect: Effect,
  render: (context: Context) => any
) {
  const thisContext = createContext(false);
  (parentContext.children ??= new Set()).add(thisContext);
  effectsQueue.set(thisContext, effect);

  return render(thisContext);
}

export function disposeContext(context: Context, completely: boolean) {
  if (context.property && context.disposer && completely) {
    transact(() => context.disposer?.unsubscribe());
    delete context.disposer;
  }

  if (context.children && context.children?.size > 0) {
    for (const childContext of context.children) {
      context.children.delete(childContext);
      disposeContext(childContext, true);
    }
    delete context.children;
  }

  if (!context.property && context.disposer) {
    transact(() => context.disposer!.unsubscribe());
    delete context.disposer;
  }
}

export function runFlow(initiator = !isUpdating): void {
  if (initiator) {
    isUpdating = true;

    // Disposing
    if (disposeQueue.size > 0) {
      for (const context of disposeQueue) {
        disposeQueue.delete(context);
        disposeContext(context, false);
      }
    }

    // Render
    if (renderQueue.size > 0) {
      let iterations = renderQueue.size;
      for (const [render, [parentContext, context]] of renderQueue) {
        renderQueue.delete(render);
        iterations--;

        if (parentContext === null || parentContext.children?.has(context))
          render(context);
        if (iterations === 0) break;
      }
    }

    // Effects
    if (effectsQueue.size > 0) {
      for (const [context, effect] of effectsQueue) {
        effectsQueue.delete(context);
        context.disposer = transact(() => effect.subscribe(observerNever));
      }
    }

    if (renderQueue.size > 0) return runFlow(true);

    isUpdating = false;
  }
}
