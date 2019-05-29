export default class Hooks {
  hooks = new Map();
  constructor() {}

  add(name: string, fn: Function) {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, new Set());
    }
    const hook = this.hooks.get(name);
    hook.add(fn);
    return this;
  }

  invoke(name: string, ...args: Array<any>) {
    if (this.hooks.has(name)) {
      this.hooks.get(name).forEach((fn: Function) => {
        fn(...args);
      });
    }
    return this;
  }

  async invokePromise(name: string, ...args: Array<any>) {
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
