/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */

declare module "@lugia/lugiax-core" {
  declare type Handler = {
    mutations: Mutation,
    getState(): Object
  };

  declare type AsyncHandler = Handler & {
    wait: MutationFunction => Promise<Object>
  };

  declare type SyncMutationFunction = (
    data: Object,
    param: Object,
    handle: AsyncHandler
  ) => any;
  declare type SyncMutation = {
    [key: string]: SyncMutationFunction
  };

  declare type AsyncMutationFunction = (
    modelData: Object,
    param: Object,
    handle: AsyncHandler
  ) => Promise<any>;

  declare type AsyncMutation = {
    [key: string]: AsyncMutationFunction
  };

  declare type Mutations = {
    sync?: SyncMutation,
    async?: AsyncMutation
  };
  declare type MutationType = "async" | "sync";

  declare type MutationID = { name: string };
  declare type MutationFunction = {
    mutationType: MutationType,
    mutationId: string,
    model: string
  } & ((param?: Object) => any);
  declare type Mutation = {
    [key: string]: MutationFunction
  };
  declare type RegisterResult = {
    getState: () => Object,
    model: string,
    mutations: Mutation,
    addMutation: (mutationName: string, func: SyncMutationFunction) => void,
    addAsyncMutation: (
      mutationName: string,
      func: AsyncMutationFunction
    ) => void
  };

  declare type RegisterParam = {
    model: string,
    state: Object,
    mutations?: Mutations
  };

  declare type Option = {
    force: boolean // 是否强制注册 默认为false
  };
  declare type WaitHandler = (
    mutation: MutationFunction,
    param: Object,
    handler: AsyncHandler
  ) => Promise<any>;

  declare type SubscribeResult = {
    unSubscribe: Function
  };

  declare export interface LugiaxType {
    register(param: RegisterParam, option?: Option): RegisterResult;

    getState(): Object;

    getStore(): Object;

    /**
     * 根据model名称订阅相关模型数据变化消息
     * @param modelName
     * @param () => any
     */
    subscribe(
      modelName: string,
      (newModelState: Object, oldModelState: Object) => any
    ): SubscribeResult;

    clear(): void;

    resetStore(configMiddleWare: ?Object, reducerMap?: Function): void;

    subscribeAll(() => any): SubscribeResult;

    on(cb: WaitHandler): void;

    takeEveryAction(cb: (action: Object) => Promise<any>): any;
  }

  declare module.exports: LugiaxType;
}
