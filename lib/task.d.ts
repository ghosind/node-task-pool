export declare class Task {
    private func;
    private args;
    constructor(func: Function, ...args: any[]);
    exec(): any;
}
