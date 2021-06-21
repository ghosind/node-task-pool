"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
class Task {
    constructor(func, ...args) {
        this.func = func;
        this.args = args;
    }
    exec() {
        return this.func(...this.args);
    }
}
exports.Task = Task;
