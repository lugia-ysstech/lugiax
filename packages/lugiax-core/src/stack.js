/**
 *
 * create by fjz
 *
 * @flow
 */

import type { StackConstructorOption } from "@lugia/lugiax-core";

export default class Stack {
  popExecuteFn: function;
  pushExecuteFn: function;
  data: string[];
  emptyFn = () => {};
  constructor(opt: StackConstructorOption) {
    try {
      const { popExecuteFn, pushExecuteFn } = opt || {};
      this.data = [];
      this.popExecuteFn =
        typeof popExecuteFn === "function" ? popExecuteFn : this.emptyFn;
      this.pushExecuteFn =
        typeof pushExecuteFn === "function" ? pushExecuteFn : this.emptyFn;
    } catch (e) {
      throw new Error("Stack init error:" + e.message);
    }
  }
  push(item) {
    this.data.push(item);
    this.pushExecuteFn(item);
  }
  pop() {
    const v = this.data.pop();
    if (this.data.length === 0) {
      this.popExecuteFn();
    }
    return v;
  }
}
