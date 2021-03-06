# @antmind/task-pool

[![Latest version](https://img.shields.io/github/v/release/ghosind/node-task-pool?include_prereleases)](https://github.com/ghosind/node-task-pool)
[![NPM](https://img.shields.io/npm/v/@antmind/task-pool)](https://www.npmjs.com/package/@antmind/task-pool)
[![Github Actions build](https://img.shields.io/github/workflow/status/ghosind/node-task-pool/Node.js%20CI)](https://github.com/ghosind/node-task-pool)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b00f10bfb94641eea45837c973c2f86b)](https://www.codacy.com/gh/ghosind/node-task-pool/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ghosind/node-task-pool&amp;utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/ghosind/node-task-pool/branch/main/graph/badge.svg?token=UZ7SOSC9RH)](https://codecov.io/gh/ghosind/node-task-pool)
[![License](https://img.shields.io/github/license/ghosind/node-task-pool)](https://github.com/ghosind/node-task-pool)

English | [简体中文](README-CN.md)

`@antmind/task-pool` is a simple Node.js functional tasks pool implementation, supported both synchronous and asynchronous functions.

## Installation

- Using NPM:

  ```sh
  npm install --save @antmind/task-pool
  ```

- Using Yarn:

  ```sh
  yarn add @antmind/task-pool
  ```

## Getting Started

1. Import `TaskPool` and `Task` from `@antmind/task-pool`.

2. Create a new task pool instance, and you can set concurrency limit if you need.

3. Create tasks instance and add them into task pool.

4. Call `exec()` method to execute functions.

### Example

```ts
import { Task, TaskPool } from '@antmind/task-pool';

const pool = new TaskPool();

for (let i = 5; i > 0; i -= 1) {
  const task = new Task((val: any) => val, i);
  pool.addTask(task);
}

pool.exec().then((data: any) => console.log(data));
// [ 5, 4, 3, 2, 1 ]
```

## Concurrency Control

You can limit the task concurrency number by `concurrency` option, and this value must equal or greater than `0`.

```ts
import { Task, TaskPool } from '@antmind/task-pool';

const pool = new TaskPool({ concurrency: 3 });

for (let i = 5; i > 0; i -= 1) {
  pool.addTask(
    new Task(
      (val: any) => new Promise((resolve: Function) => {
        setTimeout(
          () => {
            console.log(`num: ${val}`);
            resolve(val);
          },
          val * 100,
        );
      }),
      i,
    ),
  );
}

pool.exec().then((data) => console.log(data));
// num: 3
// num: 4
// num: 5
// num: 1
// num: 2
// [ 5, 4, 3, 2, 1 ]
```

### Unlimited concurrency mode

You can set `concurrency` option as `0` to enable unlimited concurrency mode, it's similar with `Promise.all`.

```ts
import { Task, TaskPool } from '@antmind/task-pool';

const pool = new TaskPool({ concurrency: 0 });

for (let i = 5; i > 0; i -= 1) {
  pool.addTask(
    new Task(
      (val: any) => new Promise((resolve: Function) => {
        setTimeout(
          () => {
            console.log(`num: ${val}`);
            resolve(val);
          },
          val * 100,
        );
      }),
      i,
    ),
  );
}

pool.exec().then((data) => console.log(data));
// num: 1
// num: 2
// num: 3
// num: 4
// num: 5
// [ 5, 4, 3, 2, 1 ]
```

## Configurations

- `concurrency`: The tasks maximum concurrency limit number, it should be a integer number greater or equals to `0`, and the default value is `30`. Set this option value to `0` to enable unlimited concurrency mode.

- `throwsError`: Throw error when some task failed if this option set to `true`, and do not throw error if set to `false` (you can get errors by `getErrors()` method). The default value is `true`.

## APIs

### Class `TaskPool`

#### Constructor

- `constructor()`

- `constructor(options: TaskPoolOptions)`

- `constructor(task: Task | Task[], options?: TaskPoolOptions)`

#### Methods

- `exec(): Promise<any[]>`

  Execute all tasks in the pool, and it'll return a result array after executing.

- `addTask(task: Task): number`

  Add a task into task pool, and it'll return the task id.

- `addTasks(tasks: Task[]): number[]`
  
  Add a tasks array into task pool, and it'll return the tasks' id.

- `setConcurrency(concurrency: number): void`

  Set concurrency limits.

- `getErrors(): Array<Error | undefined>`

  Get errors of last execution, and the index of error is same as task index.

- `getTask(id: number): Task | null`

  Get task by id.

### Class `Task`

#### Constructor

- `constructor(func: Function, ...args: any[])`

#### Method

- `exec(): any`

  Execute this task.

- `setArgs(...args: any[]): void`

  Set function arguments.

## License

This project has been published under MIT license, you can get more detail in `LICENSE` file.
