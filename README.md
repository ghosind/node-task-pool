# node-task-pool

[![Latest version](https://img.shields.io/github/v/release/ghosind/node-task-pool?include_prereleases)](https://github.com/ghosind/node-task-pool)
[![NPM](https://img.shields.io/npm/v/@antmind/task-pool)](https://www.npmjs.com/package/@antmind/task-pool)
[![Github Actions build](https://img.shields.io/github/workflow/status/ghosind/node-task-pool/Node.js%20CI)](https://github.com/ghosind/node-task-pool)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b00f10bfb94641eea45837c973c2f86b)](https://www.codacy.com/gh/ghosind/node-task-pool/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ghosind/node-task-pool&amp;utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/ghosind/node-task-pool/branch/main/graph/badge.svg?token=UZ7SOSC9RH)](https://codecov.io/gh/ghosind/node-task-pool)
[![License](https://img.shields.io/github/license/ghosind/node-task-pool)](https://github.com/ghosind/node-task-pool)

`@antmind/task-pool` is a simple Node.js functional tasks pool implementation, supported both synchronous and asynchronous functions.

## Installation

Using NPM:

```sh
npm install --save @antmind/task-pool
```

## Getting Started

```ts
import { Task, TaskPool } from '@antmind/task-pool';

const pool = new TaskPool({ size: 3 });

for (let i = 5; i > 0; i -= 1) {
  pool.addTask(
    new Task((val: any) => {
      return new Promise((resolve: Function) => {
        setTimeout(() => { console.log(`num: ${val}`); }, val * 100);
      });
    ),
    i,
  );
}

pool.exec();
// num: 3
// num: 4
// num: 5
// num: 2
// num: 1
```

## Configurations

- `size`: The concurrency size of execution, default `30`.

## Class `TaskPool`

- `addTask(task: Task | Task[]): void`

  Add a task or tasks array into task pool.

- `exec(): Promise<T[]>`

  Execute all tasks in the pool, and it'll return a result array after executing.

## Class `Task`

- `exec(): any`

  Execute this task.
