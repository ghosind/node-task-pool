import { EventEmitter } from 'events';
import { Task } from './task';

interface TaskPoolOptions {
  /**
   * A positive number or zero to indicates maximum concurrency limit number, no limitation if it's
   * set to 0 (similar with `Promise.all()`).
   */
  concurrency?: number;

  /**
   * Is throws error and terminates tasks if some task threw error, default true.
   */
  throwsError?: boolean;
}

export class TaskPool extends EventEmitter {
  private readonly DEFAULT_CONCURRENCY = 30;

  private tasks: Task[] = [];

  private concurrency: number;

  private throwsError: boolean;

  private resolutions: any[] = [];

  private errors: Array<Error | undefined> = [];

  private isRunning: boolean = false;

  private queue: number[] = [];

  private running: Set<number> = new Set();

  constructor();

  /**
   * @param options Task pool configurations.
   */
  // eslint-disable-next-line no-unused-vars
  constructor(options: TaskPoolOptions);

  /**
   * @param tasks A task or task list.
   * @param options Task pool configurations.
   */
  // eslint-disable-next-line no-unused-vars
  constructor(tasks: Task | Task[], options?: TaskPoolOptions);

  constructor(tasks?: Task | Task[] | TaskPoolOptions, optionParams?: TaskPoolOptions) {
    super();

    let options = optionParams;

    if (tasks) {
      if (tasks instanceof Task) {
        this.tasks = [tasks];
      } else if (tasks instanceof Array) {
        this.tasks = tasks;
      } else {
        options = tasks;
      }
    }

    this.concurrency = options?.concurrency || this.DEFAULT_CONCURRENCY;
    if (typeof this.concurrency !== 'number' || this.concurrency < 0) {
      throw new TypeError('Invalid concurrency number');
    }

    if (typeof options?.throwsError === 'boolean') {
      this.throwsError = options.throwsError;
    } else {
      this.throwsError = true;
    }

    this.on('done', this.nextTask);
  }

  /**
   * Add a task or tasks array into pool.
   * @param task Task instance or task instances array.
   */
  addTask(task: Task | Task[]) {
    if (task instanceof Task) {
      this.tasks.push(task);
    } else if (task instanceof Array) {
      task.forEach((t: Task) => {
        if (!(t instanceof Task)) {
          throw new TypeError('Invalid task');
        }
        this.tasks.push(t);
      });
    } else {
      throw new TypeError('Invalid task');
    }
  }

  /**
   * Execute all tasks in the pool.
   * @async
   */
  async exec(): Promise<any[]> {
    if (this.tasks.length === 0) {
      return this.resolutions;
    }

    this.checkRunningState();

    return this.run();
  }

  /**
   * Set concurrency limits.
   * @param concurrency The maximum concurrency tasks number.
   */
  setConcurrency(concurrency: number) {
    if (typeof concurrency !== 'number' || concurrency < 0) {
      throw new TypeError('Invalid concurrency number');
    }

    this.concurrency = concurrency;
  }

  /**
   * Gets execution errors of last time.
   */
  getErrors() {
    return [...this.errors];
  }

  private runTask(index: number) {
    if (index >= this.tasks.length) {
      throw new Error('Invalid task');
    }

    const task = this.tasks[index];

    this.running.add(index);

    try {
      Promise.resolve(task.exec()).then(
        (res: any) => {
          this.running.delete(index);
          this.resolutions[index] = res;
          this.emit('done');
        },
        (err: any) => {
          this.handleError(err, index);
        },
      );
    } catch (err: any) {
      this.handleError(err, index);
    }
  }

  private nextTask() {
    const next = this.queue.shift();
    if (next === undefined && this.queue.length === 0) {
      if (this.running.size === 0) {
        this.emit('completed');
      }
    } else if (next !== undefined) {
      this.runTask(next);
    }
  }

  private run() {
    this.running.clear();
    this.queue = [];
    this.isRunning = true;

    // clear last resolutions and errors
    this.resolutions = [];
    this.errors = [];

    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve: (value: any) => any, reject: (reason: any) => any) => {
      this.on('error', (err: any) => {
        reject(err);
      });

      this.on('completed', () => {
        this.isRunning = false;
        resolve(this.resolutions);
      });

      for (let i = 0; i < this.tasks.length; i += 1) {
        if (this.concurrency > 0 && this.running.size >= this.concurrency) {
          this.queue.push(i);
        } else {
          this.runTask(i);
        }
      }
    });
  }

  private checkRunningState() {
    if (this.isRunning) {
      throw new Error('Task pool is executing');
    }
  }

  private handleError(err: any, index: number) {
    if (this.throwsError) {
      this.emit('error', err);
    } else {
      this.running.delete(index);
      this.errors[index] = err;
      this.emit('done');
    }
  }
}
