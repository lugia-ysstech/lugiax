/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */
import type { RegisterResult, } from '@lugia/lugiax-core';

declare module '@lugia/lugiax' {
  declare type EventMuationConfig = {
    [eventName: string]: { [fieldName: string]: Function }
  };

  declare type EventHandle = {
    [eventName: string]: Function
  };
  declare type BindConfig = string | { [fieldName: string]: string };
  declare type Field2Props = { [key: string]: string };

  declare interface Lugiax {
    connect(
      model: RegisterResult | Array<RegisterResult>,
      mapProps: (state: Object) => Object,
      map2Mutations: (mutations: Object) => Object,
      opt?: { props: Object }
    ): (target: Object) => any;

    bind(
      modelData: RegisterResult,
      mapValue: (state: Object) => { [valueName: string]: any },
      trigger: {
        [eventName: string]: (mutations: Object, ...args: any) => any
      }
    ): any;

    bindTo(
      modelData: RegisterResult,
      bindConfig: BindConfig,
      eventConfig: EventMuationConfig,
      eventHandle: EventHandle
    ): any;
  }

  declare type RouterConfig = {
    render: Function,
    component: Function
  };

  declare type RouterMap = {
    [path: string]: RouterConfig
  };
  declare module.exports: Lugiax;
}
