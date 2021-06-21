/// <reference types="node" />
import { EventEmitter } from 'events';
import { Task } from './task';
interface TaskPoolOptions {
    size: number;
}
export declare class TaskPool extends EventEmitter {
    private readonly DEFAULT_POOL_SIZE;
    private tasks;
    private size;
    private resolutions;
    private isRunning;
    private queue;
    private running;
    constructor();
    constructor(options: TaskPoolOptions);
    constructor(tasks: Task | Task[], options?: TaskPoolOptions);
    addTask(task: Task | Task[]): void;
    exec(): Promise<any>;
    private checkOptions;
    private runTask;
    private nextTask;
    private run;
    private checkRunningState;
}
export {};
