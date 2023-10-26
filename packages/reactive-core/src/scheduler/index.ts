type Task = () => void;

export interface Scheduler {
  now: number;
  schedule(work: Task, prevTick: number): void;
  runOrQueue(work: Task): void;
  transact(fn: () => void): void;
}

export const newScheduler = (): Scheduler => {
  const taskQueue: Set<Task> = new Set();
  let transacting = false;
  let scheduling = false;
  let tick = -1;

  const transact = (fn: () => void) => {
    const initiator = !transacting;
    if (initiator) {
      ++tick;
      transacting = true;
    }

    fn();

    if (taskQueue.size > 0) {
      processQueue();
    } else {
      --tick;
    }

    if (initiator) {
      transacting = false;
    }
  };

  const schedule = (task: Task, prevTick: number) => {
    const initiator = !scheduling && !transacting;
    if (initiator) {
      ++tick;
      scheduling = true;
    }

    if (prevTick !== tick) {
      runOrQueue(task, transacting);
    }

    if (initiator) {
      if (taskQueue.size > 0) processQueue();
      scheduling = false;
    }
  };

  const runOrQueue = (task: Task, locked: boolean = scheduling) => {
    if (locked) {
      taskQueue.add(task);
    } else {
      task();
    }
  };

  function processQueue() {
    for (const task of taskQueue) {
      taskQueue.delete(task);
      task();
    }
  }

  return {
    get now() {
      return tick;
    },
    runOrQueue,
    transact,
    schedule,
  };
};

export const scheduler = newScheduler();
