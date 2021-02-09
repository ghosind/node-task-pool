/* eslint-disable no-undef */
import assert from 'assert';

import { Task, TaskPool } from '../lib';

// eslint-disable-next-line max-lines-per-function
describe('Pool class test', () => {
  it('wrong pool size', () => {
    assert.throws(() => {
      const pool = new TaskPool({ size: -1 });
      pool.exec();
    });
  });

  it('empty pool execution', async () => {
    const pool = new TaskPool([]);
    const ret = await pool.exec();

    assert.deepStrictEqual(ret, []);
  });

  it('task pool with single task', async () => {
    const func = (val: number) => val;
    const task = new Task(func, 1);
    const pool = new TaskPool(task);

    const ret = await pool.exec();

    assert.deepStrictEqual(ret, [1]);
  });

  it('synchronous task pool execution', async () => {
    const result: number[] = [];
    const func = (val: number) => { result.push(val); };
    const tasks: Task[] = [];

    for (let i = 0; i < 5; i += 1) {
      const task = new Task(func, i);
      tasks.push(task);
    }

    const pool = new TaskPool(tasks);

    await pool.exec();

    assert.deepStrictEqual([0, 1, 2, 3, 4], result);
  });

  it('asynchronous task pool execution', async () => {
    const func = (val: number) => new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve(val);
      }, val % 2 ? 100 : 200);
    });
    const tasks: Task[] = [];

    for (let i = 0; i < 5; i += 1) {
      const task = new Task(func, i);
      tasks.push(task);
    }

    const pool = new TaskPool(tasks);

    const ret = await pool.exec();

    assert.deepStrictEqual([0, 1, 2, 3, 4], ret);
  });

  it('asynchronous task pool return order', async () => {
    const result: number[] = [];
    const func = (val: number) => new Promise((resolve: Function) => {
      setTimeout(() => {
        result.push(val);
        resolve();
      }, val % 2 ? 100 : 200);
    });
    const tasks: Task[] = [];

    for (let i = 0; i < 5; i += 1) {
      const task = new Task(func, i);
      tasks.push(task);
    }

    const pool = new TaskPool(tasks);

    await pool.exec();

    assert.deepStrictEqual([1, 3, 0, 2, 4], result);
  });

  it('synchronous and asynchronous mixed task pool execution', async () => {
    const func = (val: number) => {
      if (val % 2) {
        return val;
      }

      return new Promise((resolve: Function) => {
        setTimeout(() => {
          resolve(val);
        }, 100);
      });
    };
    const tasks: Task[] = [];

    for (let i = 0; i < 5; i += 1) {
      const task = new Task(func, i);
      tasks.push(task);
    }

    const pool = new TaskPool(tasks);

    const ret = await pool.exec();

    assert.deepStrictEqual([0, 1, 2, 3, 4], ret);
  });

  it('synchronous and asynchronous mixed task pool resolve order', async () => {
    const result: number[] = [];
    const func = (val: number) => {
      if (val % 2) {
        result.push(val);
        return null;
      }

      return new Promise((resolve: Function) => {
        setTimeout(() => {
          result.push(val);
          resolve();
        }, 100);
      });
    };
    const tasks: Task[] = [];

    for (let i = 0; i < 5; i += 1) {
      const task = new Task(func, i);
      tasks.push(task);
    }

    const pool = new TaskPool(tasks);

    await pool.exec();

    assert.deepStrictEqual([1, 3, 0, 2, 4], result);
  });

  it('re-run when pool is running', () => {
    const func = () => new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
    const pool = new TaskPool(new Task(func));
    pool.exec();
    assert.rejects(pool.exec);
  });

  it('throw error inside pool', async () => {
    const func = () => new Promise((resolve: Function, reject: Function) => {
      reject(new Error('test'));
    });
    const pool = new TaskPool(new Task(func));
    assert.rejects(pool.exec());
  });

  it('execute with limited concurrency (pool size)', async () => {
    const func = (val: number) => new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve(val);
      }, 100);
    });
    const tasks: Task[] = [];

    for (let i = 0; i < 5; i += 1) {
      tasks.push(new Task(func, i));
    }

    const pool = new TaskPool(tasks, { size: 2 });

    const ret = await pool.exec();
    assert.deepStrictEqual([0, 1, 2, 3, 4], ret);
  });
});
