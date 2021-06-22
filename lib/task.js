"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
class Task {
    /**
     * @param func Function handler.
     * @param args Function execution arguments.
     */
    constructor(func, ...args) {
        if (typeof func !== 'function') {
            throw new TypeError('Invalid function');
        }
        this.func = func;
        this.args = args || [];
    }
    /**
     * Executes function with specific arguments.
     */
    exec() {
        return this.func(...this.args);
    }
    /**
     * Sets function arguments.
     * @param args Function execution arguments.
     */
    setArgs(...args) {
        this.args = args || [];
    }
}
exports.Task = Task;
