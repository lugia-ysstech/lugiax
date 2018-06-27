/**
 *
 * create by ligx
 *
 * @flow
 */
import type { Action, Lugiax, Option, RegisterParam, } from '@lugia/lugiax';

import { combineReducers, createStore, } from 'redux';

const GlobalReducer = combineReducers({
  lugia() {
    return {};
  },
});
let existModel = {};
let store = createStore(GlobalReducer);
const modules: Lugiax = {
  register(param: RegisterParam, option: Option = { force: false, }): Action {
    const { model, } = param;
    const { force, } = option;
    if (!force && existModel[model]) {
      throw new Error('重复注册模块');
    }

    const { state: initState, } = param;
    existModel[model] = param;
    store.replaceReducer(
      combineReducers({
        lugia() {
          return {};
        },
        [model](state = initState) {
          return state;
        },
      })
    );

    return {};
  },

  dispatch(action: Action): void {},

  getState(): Object {
    return store.getState();
  },
  subscribe(): void {},
  clear(): void {
    existModel = {};
    store = createStore(GlobalReducer);
  },
};
export default modules;
