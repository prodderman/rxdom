export const memo5 = <A, B, C, D, E, F>(
  f: (a: A, b: B, c: C, d: D, e: E) => F
): ((a: A, b: B, c: C, d: D, e: E) => F) => {
  let hasValue = false;
  let lastA: A;
  let lastB: B;
  let lastC: C;
  let lastD: D;
  let lastE: E;
  let lastF: F;
  return (a, b, c, d, e) => {
    if (
      !hasValue ||
      !Object.is(lastA, a) ||
      !Object.is(lastB, b) ||
      !Object.is(lastC, c) ||
      !Object.is(lastD, d) ||
      !Object.is(lastE, e)
    ) {
      hasValue = true;
      lastA = a;
      lastB = b;
      lastC = c;
      lastD = d;
      lastE = e;
      lastF = f(a, b, c, d, e);
    }
    return lastF;
  };
};

export const memo4 = <A, B, C, D, E>(
  f: (a: A, b: B, c: C, d: D) => E
): ((a: A, b: B, c: C, d: D) => E) => {
  let hasValue = false;
  let lastA: A;
  let lastB: B;
  let lastC: C;
  let lastD: D;
  let lastE: E;
  return (a, b, c, d) => {
    if (
      !hasValue ||
      !Object.is(lastA, a) ||
      !Object.is(lastB, b) ||
      !Object.is(lastC, c) ||
      !Object.is(lastD, d)
    ) {
      hasValue = true;
      lastA = a;
      lastB = b;
      lastC = c;
      lastD = d;
      lastE = f(a, b, c, d);
    }
    return lastE;
  };
};

export const memo3 = <A, B, C, D>(
  f: (a: A, b: B, c: C) => D
): ((a: A, b: B, c: C) => D) => {
  let hasValue = false;
  let lastA: A;
  let lastB: B;
  let lastC: C;
  let lastD: D;
  return (a, b, c) => {
    if (
      !hasValue ||
      !Object.is(lastA, a) ||
      !Object.is(lastB, b) ||
      !Object.is(lastC, c)
    ) {
      hasValue = true;
      lastA = a;
      lastB = b;
      lastC = c;
      lastD = f(a, b, c);
    }
    return lastD;
  };
};

export const memo2 = <A, B, C>(f: (a: A, b: B) => C): ((a: A, b: B) => C) => {
  let hasValue = false;
  let lastA: A;
  let lastB: B;
  let lastC: C;
  return (a, b) => {
    if (!hasValue || !Object.is(lastA, a) || !Object.is(lastB, b)) {
      hasValue = true;
      lastA = a;
      lastB = b;
      lastC = f(a, b);
    }
    return lastC;
  };
};

export const memo1 = <A, B>(f: UnaryFn<A, B>): UnaryFn<A, B> => {
  let hasValue = false;
  let lastA: A;
  let lastB: B;
  return (a) => {
    if (!hasValue || !Object.is(lastA, a)) {
      hasValue = true;
      lastA = a;
      lastB = f(a);
    }
    return lastB;
  };
};

export const memo0 = <A>(f: () => A): (() => A) => {
  let hasValue = false;
  let lastA: A;
  return () => {
    if (!hasValue) {
      hasValue = true;
      lastA = f();
    }
    return lastA;
  };
};

export const memoMany = <Args extends readonly unknown[], Result>(
  f: (...args: Args) => Result
): ((...args: Args) => Result) => {
  let hasValue = false;
  let cachedResult: Result;
  let cachedArgs: Args;
  const update = (args: Args): void => {
    cachedResult = f(...args);
    hasValue = true;
    cachedArgs = args;
  };
  return (...args: Args): Result => {
    const length = args.length;
    if (hasValue && length === 0) {
      return cachedResult;
    }
    if (!hasValue || cachedArgs.length !== length) {
      update(args);
      return cachedResult;
    }
    for (let i = 0; i < length; i++) {
      if (cachedArgs[i] !== args[i]) {
        update(args);
        return cachedResult;
      }
    }
    return cachedResult;
  };
};

interface UnaryFn<A, B> {
  (a: A): B;
}

interface Pipe {
  (): never;
  <A>(a: A): A;
  <A, B>(a: A, fa: UnaryFn<A, B>): B;
  <A, B, C>(a: A, fa: UnaryFn<A, B>, fb: UnaryFn<B, C>): C;
  <A, B, C, D>(
    a: A,
    fa: UnaryFn<A, B>,
    fb: UnaryFn<B, C>,
    fc: UnaryFn<C, D>
  ): D;
  <A, B, C, D, E>(
    a: A,
    fa: UnaryFn<A, B>,
    fb: UnaryFn<B, C>,
    fc: UnaryFn<C, D>,
    fe: UnaryFn<D, E>
  ): E;
  <A, B, C, D, E, F>(
    a: A,
    fa: UnaryFn<A, B>,
    fb: UnaryFn<B, C>,
    fc: UnaryFn<C, D>,
    fe: UnaryFn<D, E>,
    ff: UnaryFn<E, F>
  ): F;
  <A, B, C, D, E, F, G>(
    a: A,
    fa: UnaryFn<A, B>,
    fb: UnaryFn<B, C>,
    fc: UnaryFn<C, D>,
    fe: UnaryFn<D, E>,
    ff: UnaryFn<E, F>,
    fg: UnaryFn<F, G>
  ): G;
  <A, B, C, D, E, F, G, H>(
    a: A,
    fa: UnaryFn<A, B>,
    fb: UnaryFn<B, C>,
    fc: UnaryFn<C, D>,
    fe: UnaryFn<D, E>,
    ff: UnaryFn<E, F>,
    fg: UnaryFn<F, G>,
    fh: UnaryFn<G, H>
  ): H;
  <A, B, C, D, E, F, G, H, I>(
    a: A,
    fa: UnaryFn<A, B>,
    fb: UnaryFn<B, C>,
    fc: UnaryFn<C, D>,
    fe: UnaryFn<D, E>,
    ff: UnaryFn<E, F>,
    fg: UnaryFn<F, G>,
    fh: UnaryFn<G, H>,
    fi: UnaryFn<H, I>
  ): I;
  <A, B, C, D, E, F, G, H, I>(
    a: A,
    fa: UnaryFn<A, B>,
    fb: UnaryFn<B, C>,
    fc: UnaryFn<C, D>,
    fe: UnaryFn<D, E>,
    ff: UnaryFn<E, F>,
    fg: UnaryFn<F, G>,
    fh: UnaryFn<G, H>,
    fi: UnaryFn<H, I>,
    ...fns: ((arg: unknown) => unknown)[]
  ): I;
}
export const pipe: Pipe = (...args: any[]) =>
  args.slice(1, args.length).reduce((acc, fn) => fn(acc), args[0]) as never;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const constVoid = (): void => {};
