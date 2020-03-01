/**
 *
 * create by ligx
 *
 * @flow
 */
import { fromJS, } from 'immutable';
import createData from './data';

import lugiax from '@lugia/lugiax-core';

export default {
  createModel(param: { state: Object, model: string }) {
    const { model: modelName, state = {}, } = param;

    const model = lugiax.register({
      model: modelName,
      state,
      mutations: {
        sync: {
          change(state, param) {
            const { path, value, isArray, } = param;
            if (isArray) {
              const lastIndex = path.length - 1;
              const arrayPath = path.slice(0, lastIndex);
              const array = state.getIn(arrayPath).toJS();
              array[Number(path[lastIndex])] = value;
              return state.setIn(arrayPath, fromJS(array));
            }
            return state.setIn(path, fromJS(value));
          },
        },
      },
    });

    const data = createData(state, param => {
      const { type, path, value, isArray, } = param;
      const {
        mutations: { change, },
      } = model;
      if (type === 'change') {
        change({ path, value, isArray, });
      }
    });
    return {
      model,
      data,
    };
  },
};
