# @antmind/task-pool

[![Latest version](https://img.shields.io/github/v/release/ghosind/node-task-pool?include_prereleases)](https://github.com/ghosind/node-task-pool)
[![NPM](https://img.shields.io/npm/v/@antmind/task-pool)](https://www.npmjs.com/package/@antmind/task-pool)
[![Github Actions build](https://img.shields.io/github/workflow/status/ghosind/node-task-pool/Node.js%20CI)](https://github.com/ghosind/node-task-pool)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/b00f10bfb94641eea45837c973c2f86b)](https://www.codacy.com/gh/ghosind/node-task-pool/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=ghosind/node-task-pool&amp;utm_campaign=Badge_Grade)
[![codecov](https://codecov.io/gh/ghosind/node-task-pool/branch/main/graph/badge.svg?token=UZ7SOSC9RH)](https://codecov.io/gh/ghosind/node-task-pool)
[![License](https://img.shields.io/github/license/ghosind/node-task-pool)](https://github.com/ghosind/node-task-pool)

[English](README.md) | 简体中文

`@antmind/task-pool`是一个简单的Node.js函数任务池实现，实现了对同步、异步方法的并发控制支持。

## 安装

- 通过NPM:

  ```sh
  npm install --save @antmind/task-pool
  ```

- 通过Yarn:

  ```sh
  yarn add @antmind/task-pool
  ```

## 简单使用

1. 导入`@antmind/task-pool`包中的`TaskPool`以及`Task`。

2. 建立任务池，并根据需求设置并发限制数量（未设置默认为`30`）。

3. 创建任务实例并添加到任务池

4. 调用`exec()`方法执行任务池中的任务。

### 示例

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

## 并发控制

You can limit the task concurrency number by `concurrency` option, and this value must equal or great than `0`.

在实例化任务池`TaskPool`时可通过`options`参数中的`concurrency`控制并发数，该值必须设置为大于等于0的整数。

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

### 无限制模式

若将`concurrency`的值设置为`0`，则代表无并发数量限制，执行效果等同于`Promise.all()`。

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

## 配置设置

- `concurrency`: 最大并发任务数，需要为大于等于0的整数值，默认值为`30`。若设置为`0`则等同于执行`Promise.all()`。

- `throwsError`: 当任务执行失败（发生错误）时，是否抛出错误，默认为`true`。若设置为`false`，程序将继续执行直到所有任务都执行完成，并保存所有错误信息（可通过`getErrors()`方法获得。

## APIs

### `TaskPool`类

#### 构造函数

- `constructor()`

- `constructor(options: TaskPoolOptions)`

- `constructor(task: Task | Task[], options?: TaskPoolOptions)`

#### 类方法

- `exec(): Promise<any[]>`

  执行任务池中的任务。

- `addTask(task: Task): number`

  将一个任务实例添加到任务池中，并返回任务对应的id。

- `addTasks(task: Task | Task[]): number[]`

  将一个或多个任务实例添加到任务池中，并返回任务对应的id。

- `setConcurrency(concurrency: number): void`

  设置最大并发数。

- `getErrors(): Promise<Error | undefined>`

  获得上次执行产生的错误，错误在数组中的索引对应于任务添加的顺序。

- `getTask(id: number): Task | null`

  根据id获得对应的任务。

### `Task`类

#### 构造函数

- `constructor(func: Function, ...args: any[])`

#### 类方法

- `exec(): any`

  执行任务并返回执行结果。

- `setArgs(...args: any[]): void`

  重新设置任务参数。

## 协议

本项目使用`MIT`协议发布，可查看`LICENSE`文件获取更多信息。
