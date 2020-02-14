/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */
import type { LugiaxType, RegisterResult } from "@lugia/lugiax-core";

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

  declare type ConnectOptionType = {
    props?: Object,
    eventHandle?: EventHandle,
    withRef?: boolean,
    areStateEqual?: (preModel: Object[], nextModel: Object[]) => boolean,
    areStatePropsEqual?: (
      preStateProps: Object,
      nextStateProps: Object
    ) => boolean,
    areOwnPropsEqual?: (preOwnProps: Object, nextOwnProps: Object) => boolean
  };

  declare export function connect(
    model: RegisterResult | Array<RegisterResult>,
    mapProps: (state: Object) => Object,
    map2Mutations: (mutations: Object) => Object,
    opt?: ConnectOptionType
  ): (target: Object) => any;

  declare export function bind(
    modelData: RegisterResult,
    mapValue: (state: Object) => { [valueName: string]: any },
    trigger: {
      [eventName: string]: (mutations: Object, ...args: any) => any
    },
    opt: ?ConnectOptionType
  ): any;

  declare export function bindTo(
    modelData: RegisterResult,
    bindConfig: BindConfig,
    eventConfig: EventMuationConfig,
    opt?: ConnectOptionType
  ): any;

  declare export default LugiaxType;
}
