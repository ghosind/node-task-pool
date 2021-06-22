export declare class Task {
    private func;
    private args;
    /**
     * @param func Function handler.
     * @param args Function execution arguments.
     */
    constructor(func: Function, ...args: any[]);
    /**
     * Executes function with specific arguments.
     */
    exec(): any;
    /**
     * Sets function arguments.
     * @param args Function execution arguments.
     */
    setArgs(...args: any[]): void;
}
