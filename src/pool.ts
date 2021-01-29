import { EventEmitter } from 'events';
import { Task } from './task';

interface TaskPoolOptions {
  size: number;
}

export class TaskPool extends EventEmitter {
  private readonly DEFAULT_POOL_SIZE = 30;

  private tasks: Task[] = [];

  private size: number = this.DEFAULT_POOL_SIZE;

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

    if (options) {
      this.size = options?.size || this.size;
    }

    this.checkOptions();

    this.on('done', this.nextTask);
  }

  async exec() {
    if (this.tasks.length === 0) {
      return this.resolutions;
    }

    if (this.isRunning) {
      throw new Error('Task pool is executing');
    }

    return this.run();
  }

  private checkOptions() {
    if (this.size <= 0) {
      throw new Error('Wrong task pool size');
    }
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
    if (next === undefined || this.queue.length === 0) {
      if (this.running.size === 0) {
        this.emit('completed');
      }
    } else {
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
        if (this.running.size >= this.size) {
          this.queue.push(i);
        } else {
          this.runTask(i);
        }
      }
    });
  }
}
