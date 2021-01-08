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

export interface LugiaxType {

  store: any;

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
