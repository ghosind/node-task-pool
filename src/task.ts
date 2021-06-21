export class Task {
  private func: Function;

  private args: any[];

  constructor(func: Function, ...args: any[]) {
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
   */
  setArgs(...args: any[]) {
    this.args = args || [];
  }
}
