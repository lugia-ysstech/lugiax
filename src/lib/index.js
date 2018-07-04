/**
 *
 * create by ligx
 *
 * @flow
 */
import type {
  Lugiax,
  MutationID,
  Mutations,
  MutationType,
  Option,
  RegisterParam,
  RegisterResult,
} from '@lugia/lugiax';
import { fromJS, } from 'immutable';

import { createStore, } from 'redux';
import { combineReducers, } from 'redux-immutable';

const GlobalReducer = combineReducers({
  lugia() {
    return {};
  },
});
const ReloadAction = '@lugiax/reload';
const All = '@lugia/msg/All';
const ChangeModel = '@lugiax/changeModel';

class LugiaxImpl implements Lugiax {
  modelName2Action: { [key: string]: RegisterResult };
  action2Process: { [key: string]: { body: Function, modelName: string } };
  existModel: { [key: string]: RegisterParam };
  listeners: { [key: string]: Array<Function> };
  store: Object;

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
        modelName: model,
      });
    }
    existModel[model] = param;

    const generateReducers = (model: string): Function => {
      return (state = fromJS(initState), action) => {
        const { type, } = action;
        switch (type) {
          case ChangeModel:
          case ReloadAction: {
            const { modelName, newState, } = action;
            if (model === modelName) {
              this.trigger(model, state);
              return newState;
            }
            break;
          }
          default:
            return state;
        }
      };
    };

    const newReducers = {
      lugia() {
        return {};
      },
    };

    Object.keys(existModel).forEach((key: string) => {
      newReducers[key] = generateReducers(key);
    });
    this.store.replaceReducer(combineReducers(newReducers));
    const { mutations, } = param;
    if (!mutations) {
      return {};
    }

    const sync = this.generateMutation(mutations, model, 'sync');
    const async = this.generateMutation(mutations, model, 'async');

    const result = Object.assign({}, sync, async);
    return (this.modelName2Action[model] = result);
  }

  generateMutation(
    mutations: Mutations,
    modelName: string,
    type: MutationType
  ): RegisterResult {
    const result = {};
    const targetMutations = mutations[type];
    targetMutations &&
      Object.keys(targetMutations).forEach((key: string) => {
        const name = `@lugiax/${modelName}/${type}/${key}`;
        const mutationId = { name, };

        this.action2Process[mutationId.name] = {
          body: targetMutations[key],
          modelName,
          type,
        };

        const isAsync = type === 'async';
        const mutationName = isAsync
          ? `async${key.substr(0, 1).toUpperCase()}${key.substr(1)}`
          : key;
        const mutation = isAsync
          ? async (param?: Object) => {
              await this.doMutation(mutationId, param);
            }
          : (param?: Object) => {
              this.doMutation(mutationId, param);
            };

        mutation.mutationType = type;
        result[mutationName] = mutation;
      });

    return result;
  }

  async doMutation(action: MutationID, param: ?Object): Promise<any> {
    const { name, } = action;

    const { body, modelName, } = this.action2Process[name];
    if (body) {
      const state = this.getState();

      const newState = await body(state.get(modelName), param, {
        mutations: this.modelName2Action[modelName],
      });
      if (newState) {
        this.store.dispatch({
          type: ChangeModel,
          modelName,
          newState,
        });
      }
    }
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
    this.modelName2Action = {};
    this.action2Process = {};
    this.store = createStore(GlobalReducer);
  }

  subscribeAll(cb: () => any): void {
    return this.subscribe(All, cb);
  }
}

export default new LugiaxImpl();
