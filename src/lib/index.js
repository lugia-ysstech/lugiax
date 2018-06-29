/**
 *
 * create by ligx
 *
 * @flow
 */
import type { Action, Lugiax, Option, RegisterParam, } from '@lugia/lugiax';

import { combineReducers, createStore, } from 'redux';

const GlobalReducer = combineReducers({
  lugia () {
    return {};
  },
});
const ReloadAction = '@lugiax/reload';
let existModel = {};
let store = createStore(GlobalReducer);
const modules: Lugiax = {
  register (param: RegisterParam, option: Option = { force: false, }): Action {
    const { model, } = param;
    const { force, } = option;
    const isExist = existModel[ model ];
    if (!force && isExist) {
      throw new Error('重复注册模块');
    }

    const { state: initState, } = param;

    if (isExist) {
      store.dispatch({ type: ReloadAction, newState: initState, modelName: model })
    }
    existModel[ model ] = param;

    function generateReducers (model: string): Function {
      return function (state = initState, action) {
        const { type } = action;
        switch (type) {
          case ReloadAction: {
            const { modelName, newState } = action;
            if (modelName === model) {
              return newState;
            }
          }
          default:
            return state;
        }
        return state;
      };
    }

    const newReducers = {
      lugia () {
        return {};
      },
    };

    Object.keys(existModel).forEach((key: string)=>{
      newReducers[key] = generateReducers(key);
    });
    store.replaceReducer(
      combineReducers(newReducers)
    );

    return {};
  },

  dispatch (action: Action): void {},

  getState (): Object {
    return store.getState();
  },
  subscribe (): void {},
  clear (): void {
    existModel = {};
    store = createStore(GlobalReducer);
  },
};
export default modules;
