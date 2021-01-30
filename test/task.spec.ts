/* eslint-disable no-undef */
import assert from 'assert';

import { Task } from '../lib';

describe('Task class test', () => {
  it('no argument task', () => {
    const func = () => 'result';
    const task = new Task(func);

    const res = task.exec();

    assert.strictEqual('result', res);
  });
});
