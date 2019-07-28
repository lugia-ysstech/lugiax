/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */
import type { RegisterResult, LugiaxType } from "@lugia/lugiax-core";

declare module "@lugia/lugiax" {
  declare export type EventMuationConfig = {
    [eventName: string]: { [fieldName: string]: Function }
  };

  declare export type EventHandle = {
    [eventName: string]: Function
  };
  declare export type BindConfig =
    | string
    | { [fieldName: string]: string | string[] };
  declare export type Field2Props = { [key: string]: string | string[] };

  declare export function connect(
    model: RegisterResult | Array<RegisterResult>,
    mapProps: (state: Object) => Object,
    map2Mutations: (mutations: Object) => Object,
    opt?: { props?: Object, withRef?: boolean }
  ): (target: Object) => any;

  declare export function bind(
    modelData: RegisterResult,
    mapValue: (state: Object) => { [valueName: string]: any },
    trigger: {
      [eventName: string]: (mutations: Object, ...args: any) => any
    }
  ): any;

  declare export function bindTo(
    modelData: RegisterResult,
    bindConfig: BindConfig,
    eventConfig: EventMuationConfig,
    eventHandle: EventHandle
  ): any;

  declare export default LugiaxType;
}
