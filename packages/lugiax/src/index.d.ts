
export interface Handler {
  mutations: Mutation,
  getState(): Object,
}

export interface AsyncHandler extends Handler {
  wait: (waitOption: MutationFunction) => Promise<Object>;
}

export type SyncMutationFunction = (data: Object, param: Object, handle: AsyncHandler) => any;

export type SyncMutation = {
  [key: string]: SyncMutationFunction,
};

export type StackConstructorOption = {
  onStackEmpty: Function,
  onPushItem: Function,
};

export type AsyncMutationFunction = (
  modelData: Object,
  param: Object,
  handle: AsyncHandler,
) => Promise<any>;

export type AsyncMutation = {
  [key: string]: AsyncMutationFunction,
};

export type InTimeHandler = AsyncHandler | { updateModel: (state: Object) => void, };

export type InTimeMutation = {
  [key: string]: (param: Object, handler: InTimeHandler) => any,
};

export type Mutations = {
  sync?: SyncMutation,
  async?: AsyncMutation,
  inTime?: InTimeMutation,
};

export type MutationType = 'async' | 'sync' | 'inTime';

export type MutationID = { name: string };

export type MutationFunction = {
  mutationType: MutationType,
  mutationId: string,
  model: string,
} & ((param?: Object) => any);


export type Mutation = {
  [key: string]: MutationFunction,
};

export type RegisterResult = {
  getState: () => Object,
  model: string,
  mutations: Mutation,
  destroy: () => boolean,
  addMutation: (mutationName: string, func: SyncMutationFunction) => void,
  addAsyncMutation: (mutationName: string, func: AsyncMutationFunction) => void,
};

export type RegisterParam = {
  model: string,
  state: Object,
  mutations?: Mutations,
};

export type Option = {
  force: boolean,
};
export type WaitHandler = (
  mutation: MutationFunction,
  param: Object,
  handler: AsyncHandler,
) => Promise<any>;

export type SubscribeResult = {
  unSubscribe: Function,
};

export type EventResult = {
  unSubscribe: Function,
};

declare interface LugiaxType {
  register(param: RegisterParam, option?: Option): RegisterResult;

  getState(): Object;

  getStore(): Object;

  subscribe(modelName: string, cb1: (newModelState: Object, oldModelState: Object) => any): SubscribeResult;

  clear(): void;

  resetStore(configMiddleWare?: Object, reducerMap?: Function): void;

  subscribeAll(fn: () => any): SubscribeResult;

  on(cb: WaitHandler): EventResult;

  emitEvent(event: string, param: Object): void;

  onEvent(event: string, cb: Function): EventResult;

  onceEvent(event: string, cb: Function): EventResult;

  removeAllEvent(): boolean;

  onRender(event: string, cb: Function): SubscribeResult;
}


export type EventMuationConfig = {
  [eventName: string]: { [fieldName: string]: Function }
};

export type EventHandle = {
  [eventName: string]: Function
};
export type BindConfig = string | { [fieldName: string]: string | string[] };

export type Field2Props = { [key: string]: string | string[] };

export type ConnectOptionType = {
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

export type ConnectType = (
  model: RegisterResult | Array<RegisterResult>,
  mapProps: (state: Object) => Object,
  map2Mutations: (mutations: Object) => Object,
  opt?: ConnectOptionType,
) => (target: Object) => any;

export type BindType =(
  modelData: RegisterResult,
  mapValue: (state: Object) => { [valueName: string]: any },
  trigger: {
    [eventName: string]: (mutations: Object, ...args: any) => any
  },
  opt?: ConnectOptionType,
) => any;

export type BindToType = (
  modelData: RegisterResult,
  bindConfig: BindConfig,
  eventConfig: EventMuationConfig,
  opt?: ConnectOptionType,
) => any;

declare const  a: LugiaxType;
export default a;

export const bindTo : BindToType;
export const bind : BindType;
export const connect : ConnectType;
