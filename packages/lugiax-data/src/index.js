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

    let isInnerChange = false;
    const model = lugiax.register({
      model: modelName,
      state,
      mutations: {
        sync: {
          __change__(state, param) {
            if (isInnerChange) {
              return state;
            }
            return computeState(state, param);
          },
        },
      },
    });
    const { state: data, subscribe, } = createData(state);

    model.addDataMutation = (mutationName: string, cb: Function) => {
      model.addMutation(mutationName, (state: Object, inParam: Object) => {
        return cb(state, {
          ...inParam,
          __cb2Data__: (param: Object) => {
            const { newValue, path, } = param;
            if (path === null || path === undefined) {
              return false;
            }

            isInnerChange = true;
            let target = data;
            const paths = path.split('.');
            const len = paths.length;
            for (let i = 0; i < len; i++) {
              const attr = paths[i];
              if (!(attr in target)) {
                target.$set(attr, {});
              }
              if (i === len - 1) {
                target.$set(attr, newValue);
                break;
              }
              target = target[attr];
            }
            isInnerChange = false;
            return true;
          },
        });
      });
    };

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
