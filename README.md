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

## Getting Start

```ts
import { Task, TaskPool } from '@antmind/task-pool';

const pool = new TaskPool({ size: 5 });
pool.addTask(new Task((val: any) -> { console.log('hello', val) }, 'world'));

pool.exec();
```
