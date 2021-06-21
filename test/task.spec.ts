/* eslint-disable no-undef */
import assert from 'assert';

import { Task } from '../src';

describe('Task class test', () => {
  it('invalid function', () => {
    const func = null;
    assert.throws(() => {
      // @ts-ignore
      const task = new Task(func);

      task.exec();
    });
  });

  it('no argument task', () => {
    const func = () => 'result';
    const task = new Task(func);

    const ret = task.exec();

    assert.strictEqual(ret, 'result');
  });

  it('task with argument', () => {
    const func = (name: string) => `Hello ${name}`;
    const task = new Task(func, 'Node.js');

    const ret = task.exec();

    assert.strictEqual(ret, 'Hello Node.js');
  });

  it('no argument asynchronous task', async () => {
    const func = () => new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve('result');
      }, 500);
    });

    const task = new Task(func);

    const ret = await task.exec();

    assert.strictEqual(ret, 'result');
  });

  it('asynchronous task with argument', async () => {
    const func = (name: string) => new Promise((resolve: Function) => {
      setTimeout(() => {
        resolve(`Hello ${name}`);
      }, 500);
    });

    const task = new Task(func, 'Node.js');

    const ret = await task.exec();

    assert.strictEqual(ret, 'Hello Node.js');
  });

  it('reset arguments', () => {
    const func = (val: number) => val;
    const task = new Task(func, 1);

    task.setArgs(2);

    const ret = task.exec();

    assert.strictEqual(ret, 2);
  });
});
