/**
 *
 * create by ligx
 *
 * @flow
 */

import type { OnChangeParam, LugiaxDataParam, LugiaxDataResult, } from '@lugia/lugiax-data';

import { fromJS, } from 'immutable';
import createData, { Change, Delete, } from './data';

import lugiax from '@lugia/lugiax-core';

export function computeState(state: Object, param: OnChangeParam): Object {
  if (!param) {
    return state;
  }
  const { type, path, value, operator, isArray, } = param;

  if (isArray && operator) {
    let array = state.getIn(path);
    const { params, } = param;
    array = array[operator](...params);
    return state.setIn(path, array);
  }
  switch (type) {
    case Change:
      return state.setIn(path, fromJS(value));
    case Delete:
      return state.deleteIn(path);
    default:
  }
  return state;
}

export default {
  createData(param: LugiaxDataParam): LugiaxDataResult {
    const { model: modelName, state = {}, } = param;

    const model = lugiax.register({
      model: modelName,
      state,
      mutations: {
        sync: {
          __change__(state, param) {
            return computeState(state, param);
          },
        },
      },
    });

    const { state: data, subscribe, } = createData(state);
    const {
      mutations: { __change__: change, },
    } = model;
    const trigger = param => change(param);
    const { unSubscribe: unSubscribeChange, } = subscribe(Change, trigger);
    const { unSubscribe: unSubscribeDelete, } = subscribe(Delete, trigger);
    return {
      model,
      data,
      unSubscribe() {
        unSubscribeChange();
        unSubscribeDelete();
      },
    };
  },
};
