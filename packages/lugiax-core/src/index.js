/**
 *
 * create by ligx
 *
 * @flow
 */
import type {
  LugiaxType,
  Mutation,
  MutationFunction,
  MutationID,
  Mutations,
  MutationType,
  Option,
  RegisterParam,
  RegisterResult,
  SubscribeResult,
  SyncMutationFunction,
  WaitHandler,
  InTimeMutation,
} from '@lugia/lugiax-core';
import { fromJS, } from 'immutable';
import { take, takeEvery, } from 'redux-saga/effects';

import { applyMiddleware, compose, createStore, } from 'redux';
import combineReducers from './combineReducers';
import createSagaMiddleware from 'redux-saga';

import { ObjectUtils, } from '@lugia/type-utils';
import { Subscribe, } from '@lugia/lugiax-common';
import render from './render';

const ReloadAction = '@lugiax/reload';
const All = '@lugia/msg/All';
const ChangeModel = '@lugiax/changeModel';
const DestroyModel = '@lugiax/destroyModel';
const Loading = '@lugiax/Loading';
const LoadFinished = '@lugiax/LoadFinished';
const RegisterTopic = 'register';
const MutationTimeOut = 'MutationTimeOut';
const UserCancelMutation = 'CustomCancelMutation';
class LugiaxImpl implements LugiaxType {
  modelName2Mutations: { [key: string]: Mutation };
  mutationId2Mutaions: {
    async: { [key: string]: MutationFunction },
    sync: { [key: string]: MutationFunction },
    inTime: { [key: string]: InTimeMutation },
  };
  mutationId2MutationInfo: {
    [key: string]: { body: Function, model: string, mutationId: string },
  };
  existModel: { [key: string]: RegisterParam };
  listeners: { [key: string]: { [id: string]: Function } };
  store: Object;
  sagaMiddleware: Object;
  storeEvent: Subscribe;
  lugiaxEvent: Subscribe;
  globalMutationTimeOut: number;
  modelName2MutationTimeOut: { [key: string]: number };
  mutationCancel: { [key: string]: Function }

  constructor() {
    this.clear();
    this.lugiaxEvent = new Subscribe();
    this.globalMutationTimeOut = 5 * 60 * 1000;
    this.modelMutationTimeOut = {};
    this.modelName2MutationTimeOut = {};
    this.mutationCancel = {};
  }

  trigger(topic: string, newState: Object, oldState: Object) {
    this.storeEvent.trigger(topic, newState, oldState);
    this.storeEvent.trigger(All, newState, oldState);
  }

  register(param: RegisterParam, option: Option = { force: false, }): RegisterResult {
    if (!param) {
      console.error('lugiax.register param must be not undefined!');
      return;
    }
    const { model: name, module,} = param;
    const model = module ? `${module}_${name}` : name;
    const { force, modelMutationTimeOut,} = option;
    const { existModel, } = this;
    const isExist = !!existModel[model];
    if (modelMutationTimeOut) {
      this.modelName2MutationTimeOut[model] = modelMutationTimeOut;
    }
    if (!force && isExist) {
      console.error(`${model} is exist!`);
    }
    this.warnParam(param);

    if (!param.state) {
      param = { ...param, state: {}, };
    }
    const { state: initState, } = param;

    if (isExist) {
      const oldState = this._getState_().get(model);
      const newStateJS = fromJS(initState);
      this.store.dispatch({
        type: ReloadAction,
        newState: newStateJS,
        model,
      });
      render.trigger({ [model]: model, });
      this.trigger(model, newStateJS, oldState);
    }
    existModel[model] = param;
    this.replaceReducers(existModel);
    this.store.dispatch({ type: LoadFinished, model, });

    const { mutations, } = param;
    const mutaionAddor = {
      addMutation: this.generateAddMutation(model, 'sync'),
      addAsyncMutation: this.generateAddMutation(model, 'async'),
    };
    const getState = () => {
      return this._getState_().get(model);
    };
    this.emitEvent(RegisterTopic, {
      model,
      isExist,
      state: initState,
    });
    const destroy = (target: Object) => () => {
      const modelName = target.model;
      delete target.model;
      const { mutations, } = target;
      if (mutations) {
        Object.keys(mutations).forEach(key => {
          mutations[key] = () => {};
        });
      }

      delete target.mutations;
      delete target.addMutation;
      delete target.addAsyncMutation;
      delete target.getState;
      delete target.module;
      delete target.destroy;

      target.isDestroy = true;
      this.store.dispatch({ type: DestroyModel, model: modelName, });
      delete existModel[modelName];
      this.replaceReducers(existModel);
    };

    function packModel(mutations: Object) {
      const result = {
        mutations,
        model,
        module,
        ...mutaionAddor,
        getState,
      };
      result.destroy = destroy(result);
      return result;
    }
    this.modelName2Mutations[model] = {};
    if (!mutations) {
      return packModel(this.modelName2Mutations[model]);
    }

    const sync = this.generateMutation(mutations, model, 'sync');
    const async = this.generateMutation(mutations, model, 'async');
    const inTime = this.generateMutation(mutations, model, 'inTime');

    this.modelName2Mutations[model] = Object.assign({}, sync, async, inTime);
    return packModel(this.modelName2Mutations[model]);
  }

  replaceReducers(existModel: Object) {
    const generateReducers = (targetModel: string): Function => {
      return (state = fromJS(existModel[targetModel].state), action) => {
        const { type, } = action;
        switch (type) {
          case ChangeModel:
          case ReloadAction: {
            const { model, newState, } = action;
            if (model === targetModel) {
              return newState;
            }
            return state;
          }
          case DestroyModel:
            const { model, } = action;
            if (model === targetModel) {
              return undefined;
            }
            return state;
          default:
            return state;
        }
      };
    };
    const newReducers = {
      lugia: this.lugia.bind(this),
    };

    Object.keys(existModel).forEach((key: string) => {
      newReducers[key] = generateReducers(key);
    });
    this.store.replaceReducer(this.combineReducers(newReducers));
  }

  generateAddMutation = (model: string, type: MutationType) => (
    mutationName: string,
    func: SyncMutationFunction
  ) => {
    this.checkMutationName(model, mutationName, type);
    const mutations = { [mutationName]: func, };
    const targetMutation = this.generateMutation({ [type]: mutations, }, model, type);
    Object.assign(this.modelName2Mutations[model], targetMutation);
  };

  checkMutationName(model: string, mutationName: string, type: MutationType) {
    const modelMutation = this.modelName2Mutations[model];
    const innerMutationName = type === 'sync' ? mutationName : this.addAsyncPrefix(mutationName);
    if (modelMutation && modelMutation[innerMutationName]) {
      console.warn(`The ${type} [${model}.${mutationName}] is exist model!`);
    }
  }

  warnParam(param: RegisterParam) {
    if ('mutation' in param || 'mutatons' in param) {
      console.warn('You may be set mutaions and not muation!');
    }
    if (!param.state) {
      console.warn('You may be set state!');
    }
  }

  generateMutation(mutations: Mutations, model: string, type: MutationType): Mutation {
    const result = {};
    const targetMutations = mutations[type];
    targetMutations &&
      Object.keys(targetMutations).forEach((key: string) => {
        const name = `@lugiax/${model}/${type}/${key}`;
        const mutationId = { name, };

        this.mutationId2MutationInfo[mutationId.name] = {
          body: targetMutations[key],
          model,
          mutationId: name,
          type,
        };

        let mutationName;
        let mutation;
        switch (type) {
          case 'async':
            const mutationTimeout = mutations && mutations.asyncTimeoutConfig && mutations.asyncTimeoutConfig[key];
            const currentMutationTimeout = mutationTimeout || this.modelName2MutationTimeOut[model] || this.globalMutationTimeOut;
            mutationName = this.addAsyncPrefix(key);
            mutation = async (param?: Object) => {
              return await this.doAsyncMutation(mutationId, param, currentMutationTimeout);
            };
            break;
          case 'sync':
            mutationName = key;
            mutation = (param?: Object) => {
              return this.doSyncMutation(mutationId, param);
            };
            break;
          case 'inTime':
            mutationName = this.addInTimeSuffix(key);
            mutation = async (param?: Object) => {
              return this.doInTimeMutation(mutationId, param);
            };
            break;
          default:
        }

        mutation.mutationType = type;
        mutation.mutationId = name;
        mutation.model = model;
        this.mutationId2Mutaions[type][name] = mutation;
        result[mutationName] = mutation;
      });

    return result;
  }

  addAsyncPrefix(key: string): string {
    return `async${key.substr(0, 1).toUpperCase()}${key.substr(1)}`;
  }

  addInTimeSuffix(key: string): string {
    return `${key}InTime`;
  }

  async doAsyncMutation(action: MutationID, param: ?Object, currentMutationTimeout?: number): Promise<any> {
    const { name, } = action;

    const { body, model, mutationId, } = this.mutationId2MutationInfo[name];
    render.beginCall(model);
    const modelData = this.getModelData(model);
    if (body) {
      this.store.dispatch({ type: Loading, model, });
      const bodyPromiseFn = body(modelData, param, {
        mutations: this.modelName2Mutations[model],
        wait: async (mutation: MutationFunction) => {
          return this.wait(mutation);
        },
        getState: () => this.getModelData(model),
      });
      const timeOUtPromise = new Promise(resolve => {
        this.mutationCancel[mutationId] = () => resolve(UserCancelMutation) ;
        setTimeout(() => resolve(MutationTimeOut), currentMutationTimeout);
      });
      const newState = await Promise.race([bodyPromiseFn, timeOUtPromise,]);
      delete this.mutationCancel[mutationId];
      if (newState === MutationTimeOut) {
        console.error(` ${mutationId} 等待时间超过设置的的等待时间!!`);
        return modelData;
      }
      if (newState === UserCancelMutation) {
        console.warn(`用户取消了 ${mutationId} !!`);
        return modelData;
      }
      return this.updateModel(model, newState, mutationId, param, 'async');
    }
    render.endCall();
    return modelData;
  }

  async doInTimeMutation(action: MutationID, param: ?Object): Promise<any> {
    const { name, } = action;

    const { body, model, mutationId, } = this.mutationId2MutationInfo[name];
    const modelData = this.getModelData(model);
    if (body) {
      this.store.dispatch({ type: Loading, model, });

      const result = await body(param, {
        mutations: this.modelName2Mutations[model],
        wait: async (mutation: MutationFunction) => {
          return this.wait(mutation);
        },
        updateModel: state => {
          this.updateModel(model, state, mutationId, param, 'inTime');
        },
        getState: () => this.getModelData(model),
      });
      return result;
    }
    return modelData;
  }

  wait(mutation: MutationFunction): Promise<any> {
    return new Promise(res => {
      this.sagaMiddleware.run(function* () {
        const { mutationId, } = mutation;
        const { param, } = yield take(mutationId);
        res(param);
      });
    });
  }

  doSyncMutation(action: MutationID, param: ?Object): any {
    const { name, } = action;

    const { body, model, mutationId, } = this.mutationId2MutationInfo[name];
    render.beginCall(model);
    const modelData = this.getModelData(model);
    if (body) {
      this.store.dispatch({ type: Loading, model, });

      const newState = body(modelData, param, {
        mutations: this.modelName2Mutations[model],
        getState: () => this.getModelData(model),
      });
      if (ObjectUtils.isPromise(newState)) {
        throw new Error('state can not be a Promise Object ! ');
      }
      return this.updateModel(model, newState, mutationId, param, 'sync');
    }
    render.endCall();
    return modelData;
  }

  getModelData(model: string): Object {
    const state = this._getState_();
    return state.get(model);
  }

  updateModel(
    model: string,
    newState: Object,
    mutationId: string,
    param: ?Object,
    mutationType: MutationType
  ) {
    const modelParam = this.existModel[model];
    if (!modelParam) {
      throw new Error('$model ( name: {model} )  is not exist!');
    }
    this.store.dispatch({ type: LoadFinished, model, });
    let state = this._getState_().get(model);
    if (newState) {
      const newStateJS = fromJS(newState);
      this.store.dispatch({
        type: ChangeModel,
        model,
        newState: newStateJS,
      });
      this.trigger(model, newStateJS, state);
      state = this._getState_().get(model);
    }
    this.store.dispatch({
      type: mutationId,
      mutationType,
      param,
    });
    if (mutationType === 'inTime') {
      render.trigger({ [model]: true, });
    }else{
      render.endCall();
    }
    return state;
  }

  _microfe_: any;

  getState(): Object {
    if (this._microfe_) {
      console.warn('Currently in micro-front-end mode, not recommended!');
    }
    return this._getState_();
  }

  _getState_(): Object {
    return this.store.getState();
  }

  subscribeId: number;

  subscribe(topic: string, cb: Function): SubscribeResult {
    return this.storeEvent.subscribe(topic, cb);
  }

  onRender(eventName: string, cb: (needRenderIds: object) => void) {
    return render.onRender(eventName, cb);
  }

  reducerMap: ?Function;

  resetStore(configMiddleWare: ?Object, reducerMap: ?Function): void {
    this.createStore(configMiddleWare, reducerMap);
    this.replaceReducers(this.existModel);
  }

  createStore(configMiddleWare: ?Object, reducerMap: ?Function): void {
    this.reducerMap = reducerMap;
    const GlobalReducer = this.combineReducers({
      lugia: this.lugia.bind(this),
    });
    this.sagaMiddleware = createSagaMiddleware({});
    let middleWare;
    if (configMiddleWare) {
      middleWare = applyMiddleware(configMiddleWare, this.sagaMiddleware);
    } else {
      middleWare = applyMiddleware(this.sagaMiddleware);
    }
    let preloadedState = {};

    if (typeof window !== 'undefined') {
      if (window.__PRELOADED_STATE__) {
        preloadedState = window.__PRELOADED_STATE__;
        delete window.__PRELOADED_STATE__;
      }
      const dev = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
      if (dev) {
        const composeEnhancers =
          typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
            ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                shouldHotReload: false,
              })
            : compose;
        middleWare = composeEnhancers(middleWare);
      }
    }
    this.store = createStore(GlobalReducer, fromJS(preloadedState), middleWare);
  }

  clear(): void {
    this.storeEvent = new Subscribe();
    this.existModel = {};
    this.modelName2Mutations = {};
    this.mutationId2Mutaions = { async: {}, sync: {}, inTime: {}, };
    this.mutationId2MutationInfo = {};
    this.mutationCancel= {};
    this.modelMutationTimeOut = {};
    this.modelName2MutationTimeOut = {};
    this.createStore();
    render.clear();
  }

  combineReducers(target: Object) {
    const defineCombineReducers = this.reducerMap;
    if (defineCombineReducers) {
      return defineCombineReducers(combineReducers(target));
    }

    return combineReducers(target);
  }

  lugia(state: Object = fromJS({ loading: {}, }), action: Object) {
    const { type, model, } = action;
    switch (type) {
      case LoadFinished:
      case Loading:
        let loading = state.get('loading');
        loading = loading.set(model, type === Loading);
        state = state.set('loading', loading);
        return state;
      default:
        return state;
    }
  }

  subscribeAll(cb: () => any): SubscribeResult {
    return this.storeEvent.subscribe(All, cb);
  }

  on(cb: WaitHandler): void {
    const worker = (self: Object) => async (action: Object) => {
      const { param, type, mutationType, } = action;
      if (mutationType) {
        const mutation = this.mutationId2Mutaions[mutationType][type];
        if (mutation) {
          const { model, } = mutation;
          cb(mutation, param, {
            async wait(mutation: MutationFunction) {
              return self.wait(mutation);
            },
            mutations: this.modelName2Mutations[model],
          });
        }
      }
    };
    return this.takeEveryAction(worker(this));
  }

  takeEveryAction(cb: (action: Object) => Promise<any>) {
    let unSubscribe;
    this.sagaMiddleware.run(function* () {
      const handle = yield takeEvery('*', function* (action: Object): any {
        yield cb(action);
      });
      unSubscribe = () => handle.cancel();
    });
    return {
      unSubscribe() {
        unSubscribe && unSubscribe();
      },
    };
  }

  emitEvent(event: string, ...param: Object[]): void {
    this.lugiaxEvent.trigger(event, ...param);
  }
  onEvent(topic: string, cb: Function) {
    return this.lugiaxEvent.subscribe(topic, cb);
  }

  onceEvent(topic: string, cb: Function) {
    let unSubscribe;
    const event = this.onEvent(topic, (...param: any) => {
      if (unSubscribe) {
        unSubscribe();
      }
      cb && cb(...param);
    });
    unSubscribe = event.unSubscribe;
    return event;
  }

  removeAllEvent() {
    this.lugiaxEvent.clear();
  }

  getStore() {
    return this.store;
  }

  clearRenderQueue() {
    this.cancelMutations();
    render.clearRenderQueue();
  }

  cancelMutations(){
    for(const key  in this.mutationCancel){
      const cancelFn =  this.mutationCancel[key];
      typeof cancelFn === 'function' &&  cancelFn();
    }
  }

  setMutationTimeOut(timer) {
    this.globalMutationTimeOut = timer;
  }
}

export default new LugiaxImpl();
