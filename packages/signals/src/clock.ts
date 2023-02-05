export type Tick = number;

let tick: Tick = -1;

export const now = (): Tick => ++tick;
