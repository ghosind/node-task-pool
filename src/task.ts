export class Task {
  private func: Function;

  private args: any[];

  constructor(func: Function, ...args: any[]) {
    this.func = func;
    this.args = args;
  }

  exec() {
    return this.func(...this.args);
  }
}
