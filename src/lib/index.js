/**
 *
 * create by ligx
 *
 * @flow
 */
import type { Action, Lugiax, Option, RegisterParam, RegisterResult, } from '@lugia/lugiax';

import { combineReducers, createStore, } from 'redux';

const GlobalReducer = combineReducers({
  lugia () {
    return {};
  },
});
const ReloadAction = '@lugiax/reload';
const All = '@lugia/msg/All';


class LugiaxImpl implements Lugiax {
  action2Process: { [ key: string ]: { body: Function, modelName: string } };
  existModel: { [ key: string ]: RegisterParam };
  listeners: { [ key: string ]: Array<Function> };
  store: Object;

  constructor () {
    this.store = createStore(GlobalReducer);
    this.existModel = {};
    this.listeners = {};
    this.action2Process = {};
  }

  trigger (topic: string, state: Object) {
    const call = cb => cb(state);
    const { listeners } = this;
    const listener = listeners[ topic ];
    if (listener) {
      listener.forEach(call);
    }

    const allListener = listeners[ All ];
    if (allListener) {
      allListener.forEach(call);
    }
  }

  generateAction (modelName: string, actionName: string, actionBody: Function): string {
    const key = `@lugiax/${modelName}.${actionName}`;
    this.action2Process[ key ] = { body: actionBody, modelName };
    return key;
  }

  register (param: RegisterParam, option: Option = { force: false, }): RegisterResult {
    const { model, } = param;
    const { force, } = option;
    const { existModel } = this;
    const isExist = existModel[ model ];
    if (!force && isExist) {
      throw new Error('重复注册模块');
    }

    const { state: initState, } = param;

    if (isExist) {
      this.store.dispatch({
        type: ReloadAction,
        newState: initState,
        modelName: model,
      });
    }
    existModel[ model ] = param;

    const generateReducers = (model: string): Function => {
      return (state = initState, action) => {
        const { type, } = action;
        switch (type) {
          case ReloadAction: {
            const { modelName, newState, } = action;
            if (model === modelName) {
              this.trigger(model, state);
              return newState;
            }
          }
          default:
            return state;
        }
      };
    };

    const newReducers = {
      lugia () {
        return {};
      },
    };

    Object.keys(existModel).forEach((key: string) => {
      newReducers[ key ] = generateReducers(key);
    });
    this.store.replaceReducer(combineReducers(newReducers));
    const { action } = param;
    if (!action) {
      return {};
    }
    const result: RegisterResult = {};
    Object.keys(action).forEach((key: string) => {
      result [ key ] = { name: this.generateAction(model, key, action[ key ]) };
    });
    return result;
  }

  dispatch (action: Action): void {
    const { name } = action;

    const { body, modelName } = this.action2Process[ name ];
    if (body) {
      body(this.getState()[ modelName ]);
    }
    // action2Process[action];
  }

  getState (): Object {
    return this.store.getState();
  }

  subscribe (topic: string, cb: Function): void {
    const { listeners } = this;
    if (!listeners[ topic ]) {
      listeners[ topic ] = [];
    }
    listeners[ topic ].push(cb);
  }

  clear (): void {
    this.existModel = {};
    this.listeners = {};
    this.action2Process = {};
    this.store = createStore(GlobalReducer);
  }


  subscribeAll (cb: () => any): void {
    return this.subscribe(All, cb);
  }
}

export default new LugiaxImpl();
