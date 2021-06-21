export class Task {
  private func: Function;

  private args: any[];

  /**
   * @param func Function handler.
   * @param args Function execution arguments.
   */
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
   * @param args Function execution arguments.
   */
  setArgs(...args: any[]) {
    this.args = args || [];
  }
}
