/* eslint-disable no-undef */
import assert from 'assert';

import { Task } from '../src';

describe('Task class test', () => {
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
});
