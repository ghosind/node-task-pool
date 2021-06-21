"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPool = void 0;
const events_1 = require("events");
const task_1 = require("./task");
class TaskPool extends events_1.EventEmitter {
    constructor(tasks, optionsParam) {
        super();
        this.DEFAULT_POOL_SIZE = 30;
        this.tasks = [];
        this.size = this.DEFAULT_POOL_SIZE;
        this.resolutions = [];
        this.isRunning = false;
        this.queue = [];
        this.running = new Set();
        let options = optionsParam;
        if (tasks) {
            if (tasks instanceof task_1.Task) {
                this.tasks = [tasks];
            }
            else if (tasks instanceof Array) {
                this.tasks = tasks;
            }
            else {
                options = tasks;
            }
        }
        if (options) {
            this.size = options?.size || this.size;
        }
        this.checkOptions();
        this.on('done', this.nextTask);
    }
    addTask(task) {
        if (task instanceof task_1.Task) {
            this.tasks.push(task);
        }
        else if (task instanceof Array) {
            task.forEach((t) => {
                if (!(t instanceof task_1.Task)) {
                    throw new TypeError('Invalid task');
                }
                this.tasks.push(t);
            });
        }
        else {
            throw new TypeError('Invalid task');
        }
    }
    async exec() {
        if (this.tasks.length === 0) {
            return this.resolutions;
        }
        this.checkRunningState();
        return this.run();
    }
    checkOptions() {
        if (this.size <= 0) {
            throw new Error('Wrong task pool size');
        }
    }
    runTask(index) {
        if (index >= this.tasks.length) {
            throw new Error('Invalid task');
        }
        const task = this.tasks[index];
        this.running.add(index);
        Promise.resolve(task.exec()).then((res) => {
            this.running.delete(index);
            this.resolutions[index] = res;
            this.emit('done');
        }, (err) => {
            this.emit('error', err);
        });
    }
    nextTask() {
        const next = this.queue.shift();
        if (next === undefined && this.queue.length === 0) {
            if (this.running.size === 0) {
                this.emit('completed');
            }
        }
        else if (next !== undefined) {
            this.runTask(next);
        }
    }
    run() {
        this.running.clear();
        this.queue = [];
        this.isRunning = true;
        // eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) => {
            this.on('error', (err) => {
                reject(err);
            });
            this.on('completed', () => {
                this.isRunning = false;
                resolve(this.resolutions);
            });
            for (let i = 0; i < this.tasks.length; i += 1) {
                if (this.running.size >= this.size) {
                    this.queue.push(i);
                }
                else {
                    this.runTask(i);
                }
            }
        });
    }
    checkRunningState() {
        if (this.isRunning) {
            throw new Error('Task pool is executing');
        }
    }
}
exports.TaskPool = TaskPool;
