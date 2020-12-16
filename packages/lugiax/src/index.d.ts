import { LugiaxType, RegisterResult } from '@lugia/lugiax-core';

export type EventMuationConfig = {
  [eventName: string]: { [fieldName: string]: Function }
};

export type EventHandle = {
  [eventName: string]: Function
};
export type BindConfig = string | { [fieldName: string]: string | string[] };

export type Field2Props = { [key: string]: string | string[] };

type ConnectOptionType = {
  props?: Object,
  eventHandle?: EventHandle,
  withRef22?: boolean,
  areStateEqual?: (preModel: Object[], nextModel: Object[]) => boolean,
  areStatePropsEqual?: (
    preStateProps: Object,
    nextStateProps: Object,
  ) => boolean,
  areOwnPropsEqual?: (preOwnProps: Object, nextOwnProps: Object) => boolean,
  getterParse?: (stateName: any) => any
};

export function connect(
  model: RegisterResult | Array<RegisterResult>,
  mapProps: (state: Object) => Object,
  map2Mutations: (mutations: Object) => Object,
  opt?: ConnectOptionType,
): (target: Object) => any;

export function bind(
  modelData: RegisterResult,
  mapValue: (state: Object) => { [valueName: string]: any },
  trigger: {
    [eventName: string]: (mutations: Object, ...args: any) => any
  },
  opt?: ConnectOptionType,
): any;

export function bindTo(
  modelData: RegisterResult,
  bindConfig: BindConfig,
  eventConfig: EventMuationConfig,
  opt?: ConnectOptionType,
): any;

export default LugiaxType;

