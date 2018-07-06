/**
 *
 * create by ligx
 *
 * @flow
 */
import type {
  AsyncHandler,
  Lugiax,
  Mutation,
  MutationFunction,
  MutationID,
  Mutations,
  MutationType,
  Option,
  RegisterParam,
  RegisterResult,
} from '@lugia/lugiax';
import { fromJS, } from 'immutable';
import { take, } from 'redux-saga/effects';

import { applyMiddleware, compose, createStore, } from 'redux';
import { combineReducers, } from 'redux-immutable';
import createSagaMiddleware from 'redux-saga';

const ReloadAction = '@lugiax/reload';
const All = '@lugia/msg/All';
const ChangeModel = '@lugiax/changeModel';
const Loading = '@lugiax/Loading';
const LoadFinished = '@lugiax/LoadFinished';

class LugiaxImpl implements Lugiax {
  modelName2Mutations: { [key: string]: Mutation };
  action2Process: {
    [key: string]: { body: Function, model: string, mutationId: string }
  };
  existModel: { [key: string]: RegisterParam };
  listeners: { [key: string]: Array<Function> };
  store: Object;
  sagaMiddleware: Object;

  constructor() {
    this.clear();
  }

  trigger(topic: string, state: Object) {
    const call = cb => cb(state);
    const { listeners, } = this;
    const listener = listeners[topic];
    if (listener) {
      listener.forEach(call);
    }

    const allListener = listeners[All];
    if (allListener) {
      allListener.forEach(call);
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

    const { state: initState, } = param;

    if (isExist) {
      this.store.dispatch({
        type: ReloadAction,
        newState: fromJS(initState),
        model,
      });
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
              this.trigger(model, state);
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

        this.action2Process[mutationId.name] = {
          body: targetMutations[key],
          model,
          mutationId: name,
          type,
        };

        const isAsync = type === 'async';
        const mutationName = isAsync
          ? `async${key.substr(0, 1).toUpperCase()}${key.substr(1)}`
          : key;
        const mutation = isAsync
          ? async (param?: Object) => {
              await this.doAsyncMutation(mutationId, param);
            }
          : (param?: Object) => {
              this.doSyncMutation(mutationId, param);
            };

        mutation.mutationType = type;
        mutation.mutationId = name;
        result[mutationName] = mutation;
      });

    return result;
  }

  async doAsyncMutation(action: MutationID, param: ?Object): Promise<any> {
    const { name, } = action;

    const { body, model, mutationId, } = this.action2Process[name];
    if (body) {
      const state = this.getState();
      this.store.dispatch({ type: Loading, model, });

      const newState = await body(state.get(model), param, {
        mutations: this.modelName2Mutations[model],
        wait: async (mutation: MutationFunction) => {
          return new Promise(res => {
            this.sagaMiddleware.run(function* () {
              const { mutationId, } = mutation;
              const { param, } = yield take(mutationId);
              res(param);
            });
          });
        },
      });

      this.updateModel(model, newState, mutationId, param);
    }
  }

  doSyncMutation(action: MutationID, param: ?Object): any {
    const { name, } = action;

    const { body, model, mutationId, } = this.action2Process[name];
    if (body) {
      const state = this.getState();
      this.store.dispatch({ type: Loading, model, });

      const newState = body(state.get(model), param, {
        mutations: this.modelName2Mutations[model],
      });

      this.updateModel(model, newState, mutationId, param);
    }
  }

  updateModel(
    model: string,
    newState: Object,
    mutationId: string,
    param: ?Object
  ) {
    this.store.dispatch({ type: LoadFinished, model, });

    if (newState) {
      this.store.dispatch({
        type: ChangeModel,
        model,
        newState: fromJS(newState),
      });
    }
    this.store.dispatch({
      type: mutationId,
      param,
    });
  }

  getState(): Object {
    return this.store.getState();
  }

  subscribe(topic: string, cb: Function): void {
    const { listeners, } = this;
    if (!listeners[topic]) {
      listeners[topic] = [];
    }
    listeners[topic].push(cb);
  }

  clear(): void {
    this.existModel = {};
    this.listeners = {};
    this.modelName2Mutations = {};
    this.action2Process = {};
    const lugia = { lugia: this.lugia.bind(this), };
    const GlobalReducer = combineReducers(lugia);
    this.sagaMiddleware = createSagaMiddleware({});
    let middleWare = applyMiddleware(this.sagaMiddleware);
    let preloadedState = {};

    if (global.window) {
      if (window.__PRELOADED_STATE__) {
        preloadedState = window.__PRELOADED_STATE__;
        delete window.__PRELOADED_STATE__;
      }
      const dev =
        window.__REDUX_DEVTOOLS_EXTENSION__ &&
        window.__REDUX_DEVTOOLS_EXTENSION__();
      if (window.dev && dev) {
        middleWare = compose(
          this.sagaMiddleware,
          dev
        );
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

  subscribeAll(cb: () => any): void {
    return this.subscribe(All, cb);
  }

  takeAll(cb: (mutation: Object, param: AsyncHandler) => Promise<any>): void {}
}

export default new LugiaxImpl();
