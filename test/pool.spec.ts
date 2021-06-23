/* eslint-disable no-undef */
import assert from 'assert';

import { Task, TaskPool } from '../src';

// eslint-disable-next-line max-lines-per-function
describe('Pool class test', () => {
  it('wrong pool size', () => {
    assert.throws(() => {
      const pool = new TaskPool({ concurrency: -1 });
      pool.exec();
    });
  });

  it('set invalid concurrency', () => {
    const pool = new TaskPool();
    assert.throws(() => {
      pool.setConcurrency(-1);
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

    assert.deepStrictEqual(result, [0, 1, 2, 3, 4]);
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

    assert.deepStrictEqual(ret, [0, 1, 2, 3, 4]);
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

    assert.deepStrictEqual(result, [1, 3, 0, 2, 4]);
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

    assert.deepStrictEqual(ret, [0, 1, 2, 3, 4]);
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

    assert.deepStrictEqual(result, [1, 3, 0, 2, 4]);
  });

  it('re-execute when pool is running', async () => {
    const func = () => new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
    const pool = new TaskPool(new Task(func));
    pool.exec();
    assert.rejects(async () => { await pool.exec(); });
  });

  it('throw error inside pool', async () => {
    const func = () => new Promise((resolve: Function, reject: Function) => {
      reject(new Error('test'));
    });
    const pool = new TaskPool(new Task(func));
    assert.rejects(pool.exec());
  });

  it('execute with limited concurrency (pool size)', async () => {
    const finishSeq: number[] = [];
    const func = (val: number) => new Promise((resolve: Function) => {
      setTimeout(() => {
        finishSeq.push(val);
        resolve(val);
      }, 100 * val);
    });
    const tasks: Task[] = [];

    [6, 5, 4, 2, 0].forEach((val: number) => { tasks.push(new Task(func, val)); });

    const pool = new TaskPool(tasks, { concurrency: 2 });

    const ret = await pool.exec();

    assert.deepStrictEqual(finishSeq, [5, 6, 2, 0, 4]);
    assert.deepStrictEqual(ret, [6, 5, 4, 2, 0]);
  });

  it('reset concurrency and execute', async () => {
    const finishSeq: number[] = [];
    const func = (val: number) => new Promise((resolve: Function) => {
      setTimeout(() => {
        finishSeq.push(val);
        resolve(val);
      }, 100 * val);
    });
    const tasks: Task[] = [];

    [6, 5, 4, 3, 0].forEach((val: number) => { tasks.push(new Task(func, val)); });

    const pool = new TaskPool(tasks, { concurrency: 2 });

    pool.setConcurrency(3);

    const ret = await pool.exec();

    assert.deepStrictEqual(finishSeq, [4, 5, 0, 6, 3]);
    assert.deepStrictEqual(ret, [6, 5, 4, 3, 0]);
  });

  it('add a task', async () => {
    const func = (val: number) => new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve(val);
      }, 100);
    });
    const tasks: Task[] = [new Task(func, 0)];
    const pool = new TaskPool(tasks);

    const id = pool.addTask(new Task(func, 1));

    const ret = await pool.exec();

    assert.deepStrictEqual(ret, [0, 1]);
    assert.strictEqual(id, 1);
  });

  it('add an invalid task', async () => {
    const pool = new TaskPool();

    assert.throws(() => {
      // @ts-ignore
      pool.addTask(null);
    });
  });

  it('add a task array', async () => {
    const func = (val: number) => new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve(val);
      }, 100);
    });
    const tasks: Task[] = [new Task(func, 0)];
    const pool = new TaskPool(tasks);

    const ids = pool.addTask([new Task(func, 1), new Task(func, 2)]);

    const ret = await pool.exec();

    assert.deepStrictEqual(ret, [0, 1, 2]);
    assert.deepStrictEqual(ids, [1, 2]);
  });

  it('add an invalid array', async () => {
    const pool = new TaskPool();

    assert.throws(() => {
      // @ts-ignore
      pool.addTask([null]);
    });
  });

  it('get task in pool', () => {
    const func = (val: number) => val;
    const task = new Task(func, 1);

    const pool = new TaskPool();

    const id: number = pool.addTask(task) as number;
    assert.deepStrictEqual(pool.getTask(id), task);
    assert.deepStrictEqual(pool.getTask(id + 1), null);
  });

  it('throw error when some task failed', async () => {
    const executed: number[] = [];
    const func = (val: number) => new Promise((resolve: Function, reject: Function) => {
      executed.push(val);
      setTimeout(() => {
        if (val === 2) {
          reject(new Error());
        }
        resolve(val);
      }, val * 100);
    });

    const pool = new TaskPool({ concurrency: 1, throwsError: true });
    for (let i = 0; i < 5; i += 1) {
      pool.addTask(new Task(func, i));
    }

    await assert.rejects(async () => {
      await pool.exec();
    });
    assert.deepStrictEqual(executed, [0, 1, 2]);
  });

  it('shouldn\'t throw errors and set lastErrors when some tasks failed', async () => {
    const executed: number[] = [];
    const func = (val: number) => new Promise((resolve: Function, reject: Function) => {
      executed.push(val);
      setTimeout(() => {
        if (val === 2) {
          reject(new Error());
        }
        resolve(val);
      }, val * 100);
    });

    const pool = new TaskPool({ concurrency: 1, throwsError: false });
    for (let i = 0; i < 5; i += 1) {
      pool.addTask(new Task(func, i));
    }

    await assert.doesNotReject(async () => {
      await pool.exec();
    });
    assert.deepStrictEqual(executed, [0, 1, 2, 3, 4]);

    const errors = pool.getErrors();
    assert.ok(errors instanceof Array);
    for (let i = 0; i < 5; i += 1) {
      if (i === 2) {
        assert.ok(errors[i] instanceof Error);
      } else {
        assert.ok(errors[i] === undefined);
      }
    }
  });
});
