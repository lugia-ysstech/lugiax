/**
 *
 * create by ligx
 *
 * @flow
 */
import type { SubscribeResult, } from '@lugia/lugiax-core';

export default class Subscribe {
  listeners: { [key: string]: { [id: string]: Function } };
  constructor() {
    this.clear();
  }

  clear() {
    this.subscribeId = 0;
    this.listeners = {};
  }

  trigger(topic: string, ...param: any) {
    const call = (cb: Function) => {
      cb(...param);
    };
    const { listeners, } = this;
    const listener = listeners[topic];
    if (listener) {
      Object.keys(listener).forEach((key: string) => {
        const handle = listener[key];
        handle && call(handle);
      });
    }
  }

  subscribeId: number;

  subscribe(topic: string, cb: Function): SubscribeResult {
    const { listeners, } = this;
    if (!listeners[topic]) {
      listeners[topic] = {};
    }
    const topicId = this.subscribeId++;
    listeners[topic][topicId] = cb;
    return {
      unSubscribe() {
        delete listeners[topic][topicId];
      },
    };
  }
}
