"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskPool = void 0;
const events_1 = require("events");
const task_1 = require("./task");
class TaskPool extends events_1.EventEmitter {
    constructor(tasks, optionParams) {
        super();
        this.DEFAULT_CONCURRENCY = 30;
        this.tasks = [];
        this.resolutions = [];
        this.errors = [];
        this.isRunning = false;
        this.queue = [];
        this.running = new Set();
        let options = optionParams;
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
        this.concurrency = options?.concurrency || this.DEFAULT_CONCURRENCY;
        if (typeof this.concurrency !== 'number' || this.concurrency < 0) {
            throw new TypeError('Invalid concurrency number');
        }
        if (typeof options?.throwsError === 'boolean') {
            this.throwsError = options.throwsError;
        }
        else {
            this.throwsError = true;
        }
        this.on('done', this.nextTask);
    }
    /**
     * Add a task or tasks array into pool.
     * @param task Task instance or task instances array.
     */
    addTask(task) {
        if (task instanceof task_1.Task) {
            const length = this.tasks.push(task);
            return length - 1;
        }
        // throw error if params is not a task or a tasks array.
        throw new TypeError('Invalid task(s)');
    }
    /**
     * Add tasks array into pool.
     * @param tasks Task instances array.
     */
    addTasks(tasks) {
        let taskArr;
        if (tasks instanceof Array) {
            taskArr = tasks;
        }
        else if (tasks instanceof task_1.Task) {
            taskArr = [tasks];
        }
        else {
            throw new TypeError('Invalid task(s)');
        }
        const ids = [];
        taskArr.forEach((t) => {
            if (!(t instanceof task_1.Task)) {
                throw new TypeError('Invalid task');
            }
            const length = this.tasks.push(t);
            ids.push(length - 1);
        });
        return ids;
    }
    /**
     * Execute all tasks in the pool.
     * @async
     */
    async exec() {
        if (this.tasks.length === 0) {
            return this.resolutions;
        }
        this.checkRunningState();
        return this.run();
    }
    /**
     * Set concurrency limits.
     * @param concurrency The maximum concurrency tasks number.
     */
    setConcurrency(concurrency) {
        if (typeof concurrency !== 'number' || concurrency < 0) {
            throw new TypeError('Invalid concurrency number');
        }
        this.concurrency = concurrency;
    }
    /**
     * Gets execution errors of last time.
     */
    getErrors() {
        return [...this.errors];
    }
    /**
     * Get task instance by it's id.
     */
    getTask(id) {
        return id in this.tasks ? this.tasks[id] : null;
    }
    runTask(index) {
        if (index >= this.tasks.length) {
            throw new Error('Invalid task');
        }
        const task = this.tasks[index];
        this.running.add(index);
        try {
            Promise.resolve(task.exec()).then((res) => {
                this.running.delete(index);
                this.resolutions[index] = res;
                this.emit('done');
            }, (err) => {
                this.running.delete(index);
                this.handleError(err, index);
            });
        }
        catch (err) {
            this.handleError(err, index);
        }
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
        // clear last resolutions and errors
        this.resolutions = [];
        this.errors = [];
        // eslint-disable-next-line no-unused-vars
        return new Promise((resolve, reject) => {
            this.on('error', (err) => {
                this.isRunning = false;
                reject(err);
            });
            this.on('completed', () => {
                this.isRunning = false;
                resolve(this.resolutions);
            });
            for (let i = 0; i < this.tasks.length; i += 1) {
                if (this.concurrency > 0 && this.running.size >= this.concurrency) {
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
    handleError(err, index) {
        if (this.throwsError) {
            this.queue = [];
            this.emit('error', err);
        }
        else {
            this.running.delete(index);
            this.errors[index] = err;
            this.emit('done');
        }
    }
}
exports.TaskPool = TaskPool;
