import { EventEmitter } from 'events';
import { Task } from './task';

interface TaskPoolOptions {
  /**
   * The maximum concurrency limit number, no limitation if it's set to 0.
   */
  concurrency: number;
}

export class TaskPool extends EventEmitter {
  private readonly DEFAULT_CONCURRENCY = 30;

  private tasks: Task[] = [];

  private concurrency: number;

  private resolutions: any[] = [];

  private isRunning: boolean = false;

  private queue: number[] = [];

  private running: Set<number> = new Set();

  constructor();

  // eslint-disable-next-line no-unused-vars
  constructor(options: TaskPoolOptions);

  // eslint-disable-next-line no-unused-vars
  constructor(tasks: Task | Task[], options?: TaskPoolOptions);

  constructor(tasks?: Task | Task[] | TaskPoolOptions, optionsParam?: TaskPoolOptions) {
    super();

    let options = optionsParam;

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

    this.on('done', this.nextTask);
  }

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

  async exec() {
    if (this.tasks.length === 0) {
      return this.resolutions;
    }

    this.checkRunningState();

    return this.run();
  }

  private runTask(index: number) {
    if (index >= this.tasks.length) {
      throw new Error('Invalid task');
    }

    const task = this.tasks[index];

    this.running.add(index);

    Promise.resolve(task.exec()).then(
      (res: any) => {
        this.running.delete(index);
        this.resolutions[index] = res;
        this.emit('done');
      },
      (err: any) => {
        this.emit('error', err);
      },
    );
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
}
