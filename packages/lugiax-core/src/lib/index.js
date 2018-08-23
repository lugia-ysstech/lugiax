/**
 *
 * create by ligx
 *
 * @flow
 */
import type {
  Lugiax,
  Mutation,
  MutationFunction,
  MutationID,
  Mutations,
  MutationType,
  Option,
  RegisterParam,
  RegisterResult,
  SubscribeResult,
  WaitHandler,
} from '@lugia/lugiax-core';
import { fromJS, } from 'immutable';
import { take, takeEvery, } from 'redux-saga/effects';

import { applyMiddleware, compose, createStore, } from 'redux';
import { combineReducers, } from 'redux-immutable';
import createSagaMiddleware from 'redux-saga';

import { ObjectUtils, } from '@lugia/type-utils';

const ReloadAction = '@lugiax/reload';
const All = '@lugia/msg/All';
const ChangeModel = '@lugiax/changeModel';
const Loading = '@lugiax/Loading';
const LoadFinished = '@lugiax/LoadFinished';

class LugiaxImpl implements Lugiax {
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

  constructor() {
    this.clear();
  }

  trigger(topic: string, newState: Object, oldState: Object) {
    const call = (cb: Function) => {
      cb(newState, oldState);
    };
    const { listeners, } = this;
    const listener = listeners[topic];
    if (listener) {
      Object.keys(listener).forEach((key: string) => {
        call(listener[key]);
      });
    }

    const allListener = listeners[All];
    if (allListener) {
      Object.keys(allListener).forEach((key: string) => {
        call(allListener[key]);
      });
    }
  }

  register(
    param: RegisterParam,
    option: Option = { force: false, }
  ): RegisterResult {
    const { model, } = param;
    const { force, } = option;
    const { existModel, } = this;
    const isExist = existModel[model];
    if (!force && isExist) {
      throw new Error('重复注册模块');
    }
    this.warnParam(param);

    const { state: initState, } = param;

    if (isExist) {
      const oldState = this.getState().get(model);
      const newStateJS = fromJS(initState);
      this.store.dispatch({
        type: ReloadAction,
        newState: newStateJS,
        model,
      });
      this.trigger(model, newStateJS, oldState);
    }
    existModel[model] = param;

    const generateReducers = (targetModel: string): Function => {
      return (state = fromJS(initState), action) => {
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
    this.store.replaceReducer(combineReducers(newReducers));
    this.store.dispatch({ type: LoadFinished, model, });
    const { mutations, } = param;
    if (!mutations) {
      return { mutations: {}, model, };
    }

    const sync = this.generateMutation(mutations, model, 'sync');
    const async = this.generateMutation(mutations, model, 'async');

    const result = Object.assign({}, sync, async);
    return { mutations: (this.modelName2Mutations[model] = result), model, };
  }

  warnParam(param: RegisterParam) {
    if ('mutation' in param || 'mutatons' in param) {
      console.warn('You may be set mutaions and not muation!');
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
        const mutationId = { name, };

        this.mutationId2MutationInfo[mutationId.name] = {
          body: targetMutations[key],
          model,
          mutationId: name,
          type,
        };

        const isAsync = type === 'async';
        const mutationName = isAsync ? this.addAsyncPrefix(key) : key;
        const mutation = isAsync
          ? async (param?: Object) => {
              await this.doAsyncMutation(mutationId, param);
            }
          : (param?: Object) => {
              this.doSyncMutation(mutationId, param);
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
    const { name, } = action;

    const { body, model, mutationId, } = this.mutationId2MutationInfo[name];
    if (body) {
      const state = this.getState();
      this.store.dispatch({ type: Loading, model, });

      const newState = await body(state.get(model), param, {
        mutations: this.modelName2Mutations[model],
        wait: async (mutation: MutationFunction) => {
          return this.wait(mutation);
        },
      });

      this.updateModel(model, newState, mutationId, param, 'async');
    }
  }

  wait(mutation: MutationFunction) {
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
    if (body) {
      const state = this.getState();
      this.store.dispatch({ type: Loading, model, });

      const newState = body(state.get(model), param, {
        mutations: this.modelName2Mutations[model],
      });
      if (ObjectUtils.isPromise(newState)) {
        throw new Error('state can not be a Promise Object ! ');
      }

      this.updateModel(model, newState, mutationId, param, 'sync');
    }
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

    if (newState) {
      const oldState = this.getState().get(model);
      const newStateJS = fromJS(newState);
      this.store.dispatch({
        type: ChangeModel,
        model,
        newState: newStateJS,
      });
      this.trigger(model, newStateJS, oldState);
    }
    this.store.dispatch({
      type: mutationId,
      mutationType,
      param,
    });
  }

  getState(): Object {
    return this.store.getState();
  }

  subscribeId: number;

  subscribe(topic: string, cb: Function): SubscribeResult {
    const { listeners, } = this;
    if (!listeners[topic]) {
      listeners[topic] = {};
    }
    const topicId = this.subscribeId++ + '';
    listeners[topic][topicId] = cb;
    return {
      unSubscribe() {
        delete listeners[topic][topicId];
      },
    };
  }

  clear(): void {
    this.existModel = {};
    this.listeners = {};
    this.subscribeId = 0;
    this.modelName2Mutations = {};
    this.mutationId2Mutaions = { async: {}, sync: {}, };
    this.mutationId2MutationInfo = {};
    const lugia = { lugia: this.lugia.bind(this), };
    const GlobalReducer = combineReducers(lugia);
    this.sagaMiddleware = createSagaMiddleware({});
    let middleWare = applyMiddleware(this.sagaMiddleware);
    let preloadedState = {};

    if (typeof window !== 'undefined') {
      if (window.__PRELOADED_STATE__) {
        preloadedState = window.__PRELOADED_STATE__;
        delete window.__PRELOADED_STATE__;
      }
      const dev =
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__();
      if (dev) {
        console.info(dev(window.__REDUX_DEVTOOLS_EXTENSION__OPTIONS));
        const cfg = [applyMiddleware(this.sagaMiddleware), dev,];
        middleWare = compose(...cfg);
      } else {
        middleWare = applyMiddleware(this.sagaMiddleware);
      }
    }
    this.store = createStore(GlobalReducer, fromJS(preloadedState), middleWare);
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
    return this.subscribe(All, cb);
  }

  on(cb: WaitHandler): void {
    const worker = (self: Object) =>
      function* () {
        yield takeEvery('*', function* (action: Object) {
          const { param, type, mutationType, } = action;
          if (mutationType) {
            const mutation = self.mutationId2Mutaions[mutationType][type];
            if (mutation) {
              const { model, } = mutation;
              cb(mutation, param, {
                async wait(mutation: MutationFunction) {
                  return self.wait(mutation);
                },
                mutations: self.modelName2Mutations[model],
              });
            }
          }
        });
      };
    this.sagaMiddleware.run(worker(this));
  }
}

export default new LugiaxImpl();
