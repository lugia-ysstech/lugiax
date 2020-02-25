/**
 *
 * create by fjz
 *
 * @flow
 */

import type { StackConstructorOption } from "@lugia/lugiax-core";

export default class Stack {
  onStackEmpty: function;
  onPushItem: function;
  data: string[];
  emptyFn = () => {};
  constructor(opt: StackConstructorOption) {
    try {
      const { onStackEmpty, onPushItem } = opt || {};
      this.data = [];
      this.onStackEmpty =
        typeof onStackEmpty === "function" ? onStackEmpty : this.emptyFn;
      this.onPushItem =
        typeof onPushItem === "function" ? onPushItem : this.emptyFn;
    } catch (e) {
      throw new Error("Stack init error:" + e.message);
    }
  }
  push(item) {
    this.data.push(item);
    this.onPushItem(item);
  }
  pop() {
    const v = this.data.pop();
    if (this.data.length === 0) {
      this.onStackEmpty();
    }
    return v;
  }
}
