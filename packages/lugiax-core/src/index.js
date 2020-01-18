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
  WaitHandler
} from "@lugia/lugiax-core";
import { fromJS } from "immutable";
import { take, takeEvery } from "redux-saga/effects";

import { applyMiddleware, compose, createStore } from "redux";
import { combineReducers } from "redux-immutable";
import createSagaMiddleware from "redux-saga";

import { ObjectUtils } from "@lugia/type-utils";
import Subscribe from "./subscribe";
const ReloadAction = "@lugiax/reload";
const All = "@lugia/msg/All";
const ChangeModel = "@lugiax/changeModel";
const Loading = "@lugiax/Loading";
const LoadFinished = "@lugiax/LoadFinished";
const RegisterTopic = "register";
class LugiaxImpl implements LugiaxType {
  modelName2Mutations: { [key: string]: Mutation };
  mutationId2Mutaions: {
    async: { [key: string]: MutationFunction },
    sync: { [key: string]: MutationFunction }
  };
  mutationId2MutationInfo: {
    [key: string]: { body: Function, model: string, mutationId: string }
  };
  existModel: { [key: string]: RegisterParam };
  listeners: { [key: string]: { [id: string]: Function } };
  store: Object;
  sagaMiddleware: Object;
  storeEvent: Subscribe;
  lugiaxEvent: Subscribe;

  constructor() {
    this.clear();
    this.lugiaxEvent = new Subscribe();
  }

  trigger(topic: string, newState: Object, oldState: Object) {
    this.storeEvent.trigger(topic, newState, oldState);
    this.storeEvent.trigger(All, newState, oldState);
  }

  register(
    param: RegisterParam,
    option: Option = { force: false }
  ): RegisterResult {
    if (!param) {
      console.error("lugiax.register param must be not undefined!");
      return;
    }
    const { model } = param;
    const { force } = option;
    const { existModel } = this;
    const isExist = !!existModel[model];
    if (!force && isExist) {
      console.error(`${model} is exist!`);
    }
    this.warnParam(param);

    if (!param.state) {
      param = { ...param, state: {} };
    }
    const { state: initState } = param;

    if (isExist) {
      const oldState = this._getState_().get(model);
      const newStateJS = fromJS(initState);
      this.store.dispatch({
        type: ReloadAction,
        newState: newStateJS,
        model
      });
      this.trigger(model, newStateJS, oldState);
    }
    existModel[model] = param;
    this.replaceReducers(existModel);
    this.store.dispatch({ type: LoadFinished, model });

    const { mutations } = param;
    const mutaionAddor = {
      addMutation: this.generateAddMutation(model, "sync"),
      addAsyncMutation: this.generateAddMutation(model, "async")
    };
    const getState = () => {
      return this._getState_().get(model);
    };
    if (!mutations) {
      return {
        mutations: {},
        model,
        ...mutaionAddor,
        getState
      };
    }

    const sync = this.generateMutation(mutations, model, "sync");
    const async = this.generateMutation(mutations, model, "async");

    const result = Object.assign({}, sync, async);
    this.lugiaxEvent.trigger(RegisterTopic, { model, isExist, state:initState });
    return {
      mutations: (this.modelName2Mutations[model] = result),
      model,
      ...mutaionAddor,
      getState
    };
  }

  replaceReducers(existModel: Object) {
    const generateReducers = (targetModel: string): Function => {
      return (state = fromJS(existModel[targetModel].state), action) => {
        const { type } = action;
        switch (type) {
          case ChangeModel:
          case ReloadAction: {
            const { model, newState } = action;
            if (model === targetModel) {
              return newState;
            }
            return state;
          }
          default:
            return state;
        }
      };
    };
    const newReducers = {
      lugia: this.lugia.bind(this)
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
    const mutations = { [mutationName]: func };
    const targetMutation = this.generateMutation(
      { [type]: mutations },
      model,
      type
    );
    Object.assign(this.modelName2Mutations[model], targetMutation);
  };

  checkMutationName(model: string, mutationName: string, type: MutationType) {
    const modelMutation = this.modelName2Mutations[model];
    const innerMutationName =
      type === "sync" ? mutationName : this.addAsyncPrefix(mutationName);
    if (modelMutation && modelMutation[innerMutationName]) {
      throw new Error(`The ${type} [${model}.${mutationName}] is exist model!`);
    }
  }

  warnParam(param: RegisterParam) {
    if ("mutation" in param || "mutatons" in param) {
      console.warn("You may be set mutaions and not muation!");
    }
    if (!param.state) {
      console.warn("You may be set state!");
    }
  }

  generateMutation(
    mutations: Mutations,
    model: string,
    type: MutationType
  ): Mutation {
    const result = {};
    const targetMutations = mutations[type];
    targetMutations &&
      Object.keys(targetMutations).forEach((key: string) => {
        const name = `@lugiax/${model}/${type}/${key}`;
        const mutationId = { name };

        this.mutationId2MutationInfo[mutationId.name] = {
          body: targetMutations[key],
          model,
          mutationId: name,
          type
        };

        const isAsync = type === "async";
        const mutationName = isAsync ? this.addAsyncPrefix(key) : key;
        const mutation = isAsync
          ? async (param?: Object) => {
              return await this.doAsyncMutation(mutationId, param);
            }
          : (param?: Object) => {
              return this.doSyncMutation(mutationId, param);
            };

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

  async doAsyncMutation(action: MutationID, param: ?Object): Promise<any> {
    const { name } = action;

    const { body, model, mutationId } = this.mutationId2MutationInfo[name];
    const modelData = this.getModelData(model);
    if (body) {
      this.store.dispatch({ type: Loading, model });

      const newState = await body(modelData, param, {
        mutations: this.modelName2Mutations[model],
        wait: async (mutation: MutationFunction) => {
          return this.wait(mutation);
        },
        getState: () => this.getModelData(model)
      });

      return this.updateModel(model, newState, mutationId, param, "async");
    }
    return modelData;
  }

  wait(mutation: MutationFunction): Promise<any> {
    return new Promise(res => {
      this.sagaMiddleware.run(function*() {
        const { mutationId } = mutation;
        const { param } = yield take(mutationId);
        res(param);
      });
    });
  }

  doSyncMutation(action: MutationID, param: ?Object): any {
    const { name } = action;

    const { body, model, mutationId } = this.mutationId2MutationInfo[name];
    const modelData = this.getModelData(model);
    if (body) {
      this.store.dispatch({ type: Loading, model });

      const newState = body(modelData, param, {
        mutations: this.modelName2Mutations[model],
        getState: () => this.getModelData(model)
      });
      if (ObjectUtils.isPromise(newState)) {
        throw new Error("state can not be a Promise Object ! ");
      }

      return this.updateModel(model, newState, mutationId, param, "sync");
    }
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
      throw new Error("$model ( name: {model} )  is not exist!");
    }
    this.store.dispatch({ type: LoadFinished, model });
    let state = this._getState_().get(model);
    if (newState) {
      const newStateJS = fromJS(newState);
      this.store.dispatch({
        type: ChangeModel,
        model,
        newState: newStateJS
      });
      this.trigger(model, newStateJS, state);
      state = this._getState_().get(model);
    }
    this.store.dispatch({
      type: mutationId,
      mutationType,
      param
    });
    return state;
  }

  _microfe_: any;

  getState(): Object {
    if (this._microfe_) {
      console.warn("Currently in micro-front-end mode, not recommended!");
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

  reducerMap: ?Function;

  resetStore(configMiddleWare: ?Object, reducerMap: ?Function): void {
    this.createStore(configMiddleWare, reducerMap);
    this.replaceReducers(this.existModel);
  }

  createStore(configMiddleWare: ?Object, reducerMap: ?Function): void {
    this.reducerMap = reducerMap;
    const GlobalReducer = this.combineReducers({
      lugia: this.lugia.bind(this)
    });
    this.sagaMiddleware = createSagaMiddleware({});
    let middleWare;
    if (configMiddleWare) {
      middleWare = applyMiddleware(configMiddleWare, this.sagaMiddleware);
    } else {
      middleWare = applyMiddleware(this.sagaMiddleware);
    }
    let preloadedState = {};

    if (typeof window !== "undefined") {
      if (window.__PRELOADED_STATE__) {
        preloadedState = window.__PRELOADED_STATE__;
        delete window.__PRELOADED_STATE__;
      }
      const dev =
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__();
      if (dev) {
        const composeEnhancers =
          typeof window === "object" &&
          window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
            ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                shouldHotReload: false
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
    this.mutationId2Mutaions = { async: {}, sync: {} };
    this.mutationId2MutationInfo = {};
    this.createStore();
  }

  combineReducers(target: Object) {
    const defineCombineReducers = this.reducerMap;
    if (defineCombineReducers) {
      return defineCombineReducers(combineReducers(target));
    }

    return combineReducers(target);
  }

  lugia(state: Object = fromJS({ loading: {} }), action: Object) {
    const { type, model } = action;
    switch (type) {
      case LoadFinished:
      case Loading:
        let loading = state.get("loading");
        loading = loading.set(model, type === Loading);
        state = state.set("loading", loading);
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
      const { param, type, mutationType } = action;
      if (mutationType) {
        const mutation = this.mutationId2Mutaions[mutationType][type];
        if (mutation) {
          const { model } = mutation;
          cb(mutation, param, {
            async wait(mutation: MutationFunction) {
              return self.wait(mutation);
            },
            mutations: this.modelName2Mutations[model]
          });
        }
      }
    };
    return this.takeEveryAction(worker(this));
  }

  takeEveryAction(cb: (action: Object) => Promise<any>) {
    let unSubscribe;
    this.sagaMiddleware.run(function*() {
      const handle = yield takeEvery("*", function*(action: Object): any {
        yield cb(action);
      });
      unSubscribe = () => handle.cancel();
    });
    return {
      unSubscribe() {
        unSubscribe && unSubscribe();
      }
    };
  }

  onEvent(topic: "register", cb: Function) {
    if (!this.isSupportEvent(topic)) {
      return { unSubscribe() {} };
    }
    return this.lugiaxEvent.subscribe(topic, cb);
  }

  onceEvent(topic: "register", cb: Function) {
    let unSubscribe;
    const event = this.onEvent(topic, (...param: any)=>{
      if(unSubscribe){
        unSubscribe();
      }
      cb && cb(...param);
    });
    unSubscribe = event.unSubscribe;
    return event;
  }

  removeAllEvent(){
    this.lugiaxEvent.clear();
  }
  isSupportEvent(event: string): boolean {
    return event === RegisterTopic;
  }

  getStore() {
    return this.store;
  }
}

export default new LugiaxImpl();
