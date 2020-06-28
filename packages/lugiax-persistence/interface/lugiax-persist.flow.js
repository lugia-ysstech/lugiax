/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */

declare module '@lugia/lugiax-persistence' {
  declare type Handler = {
    mutations: Mutation,
    getState (): Object,
  };

  declare type AsyncHandler = Handler & {
    wait: MutationFunction => Promise<Object>,
  };

  declare type SyncMutationFunction = (data: Object, param: Object, handle: AsyncHandler) => any;
  declare type SyncMutation = {
    [ key: string ]: SyncMutationFunction,
  };

  declare type AsyncMutationFunction = (
    modelData: Object,
    param: Object,
    handle: AsyncHandler
  ) => Promise<any>;

  declare type AsyncMutation = {
    [ key: string ]: AsyncMutationFunction,
  };

  declare type Mutations = {
    sync?: SyncMutation,
    async?: AsyncMutation,
  };
  declare type MutationType = 'async' | 'sync';

  declare type MutationFunction = {
    mutationType: MutationType,
    mutationId: string,
    model: string,
  } & ((param?: Object) => any);
  declare type Mutation = {
    [ key: string ]: MutationFunction,
  };

  declare type Persistence = {
    getStore (model: string): Object,
    saveStore (model: string, state: Object): boolean
  };

  declare type RegisterParam = {
    model: string,
    state: Object,
    mutations?: Mutations,
  };

  declare type PersistenceOption = {
    name: ?string
  };
}
