export default class Hooks {
  public hooks = new Map();
  public add(name: string, fn: Function) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, new Set());
    }
    const hook = this.hooks.get(name);
    hook.add(fn);
    return this;
  }

  public invoke(name: string, ...args: any[]) {
    if (this.hooks.has(name)) {
      this.hooks.get(name).forEach((fn: Function) => {
        fn(...args);
      });
    }
    return this;
  }

  public async invokePromise(name: string, ...args: any[]) {
    if (this.hooks.has(name)) {
      // eslint-disable-next-line no-restricted-syntax
      for (const fn of this.hooks.get(name)) {
        // eslint-disable-next-line no-await-in-loop
        await fn(...args);
      }
    }
    return this;
  }
}
