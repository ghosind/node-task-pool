/// <reference types="node" />
import { EventEmitter } from 'events';
import { Task } from './task';
interface TaskPoolOptions {
    /**
     * A positive number or zero to indicates maximum concurrency limit number, no limitation if it's
     * set to 0 (similar with `Promise.all()`).
     */
    concurrency?: number;
    /**
     * Is throws error and terminates tasks if some task threw error, default true.
     */
    throwsError?: boolean;
}
export declare class TaskPool extends EventEmitter {
    private readonly DEFAULT_CONCURRENCY;
    private tasks;
    private concurrency;
    private throwsError;
    private resolutions;
    private errors;
    private isRunning;
    private queue;
    private running;
    constructor();
    /**
     * @param options Task pool configurations.
     */
    constructor(options: TaskPoolOptions);
    /**
     * @param tasks A task or task list.
     * @param options Task pool configurations.
     */
    constructor(tasks: Task | Task[], options?: TaskPoolOptions);
    /**
     * Add a task or tasks array into pool.
     * @param task Task instance or task instances array.
     */
    addTask(task: Task): number;
    /**
     * Add tasks array into pool.
     * @param tasks Task instances array.
     */
    addTasks(tasks: Task | Task[]): number[];
    /**
     * Execute all tasks in the pool.
     * @async
     */
    exec(): Promise<any[]>;
    /**
     * Set concurrency limits.
     * @param concurrency The maximum concurrency tasks number.
     */
    setConcurrency(concurrency: number): void;
    /**
     * Gets execution errors of last time.
     */
    getErrors(): (Error | undefined)[];
    /**
     * Get task instance by it's id.
     */
    getTask(id: number): Task | null;
    private runTask;
    private nextTask;
    private run;
    private checkRunningState;
    private handleError;
}
export {};
