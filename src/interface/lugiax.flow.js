/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */

declare module '@lugia/lugiax' {
  declare type Handler = {
    mutations: Mutation
  };

  declare type AsyncHandler = Handler & {
    wait: MutationFunction => Promise<Object>
  };

  declare type SyncMutation = {
    [key: string]: (data: Object, param: Object, handle: Handler) => any
  };

  declare type AsyncMutation = {
    [key: string]: (
      modelData: Object,
      param: Object,
      handle: AsyncHandler
    ) => Promise<any>
  };

  declare type Mutations = {
    sync?: SyncMutation,
    async?: AsyncMutation
  };
  declare type MutationType = "async" | "sync";

  declare type MutationID = { name: string };
  declare type MutationFunction = {
    type: MutationType,
    mutationId: string
  } & ((param?: Object) => any);
  declare type Mutation = {
    [key: string]: MutationFunction
  };
  declare type RegisterResult = {
    model: string,
    mutations: Mutation
  };

  declare type RegisterParam = {
    model: string,
    state: Object,
    verify?: Function,
    mutations?: Mutations
  };

  declare type Option = {
    force: boolean // 是否强制注册 默认为false
  };

  declare interface Lugiax {
    register(param: RegisterParam, option?: Option): RegisterResult;

    getState(): Object;

    /**
     * 根据model名称订阅相关模型数据变化消息
     * @param modelName
     * @param () => any
     */
    subscribe(modelName: string, () => any): void;

    clear(): void;

    subscribeAll(() => any): void;

    takeAll(cb: (mutation: Object, param: AsyncHandler) => Promise<any>): void;
  }

  declare module.exports: Lugiax;
}
