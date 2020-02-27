/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';
import { fromJS, } from 'immutable';
function getUrlAndNextCurrent(arr: Array, newCurrent: number) {
  const len = arr.length - 1;
  const nextCurrent = newCurrent > len ? len : newCurrent < 0 ? 0 : newCurrent;

  return {
    url: arr[nextCurrent],
    nextCurrent,
  };
}

const model = lugiax.register({
  model: '@lugiax/router',
  state: {
    current: 0,
    history: [],
  },
  mutations: {
    sync: {
      beforeGo(state: Object) {
        return state;
      },
      beforeReplace(state: Object) {
        return state;
      },

      reload(state: Object, inParam: Object) {
        return state.set('history', fromJS(inParam.history));
      },
    },
    async: {
      async go(state: Object, inParam: Object) {
        const { url, } = inParam;
        const { history: windowHistory, } = inParam;
        const current = state.get('current');
        if (url) {
          windowHistory.push(url);

          let history = state.get('history');
          history = history.slice(0, current + 1).push(url);
          state = state.set('current', history.size - 1);
          return state.set('history', history);
        }

        const { count, } = inParam;
        const goIndex = Math.floor(count);
        if (isNaN(goIndex)) {
          return state;
        }

        const { nextCurrent, } = getUrlAndNextCurrent(
          state.get('history').toJS(),
          current + goIndex
        );
        windowHistory.go(count);
        return state.set('current', nextCurrent);
      },

      async replace(state: Object, inParam: Object) {
        const { url, } = inParam;
        const current = state.get('current');

        let history = state.get('history');
        history = history.slice(0, current).push(url);

        state = state.set('current', history.size - 1);

        const { history: windowHistory, } = inParam;
        windowHistory.replace(url);
        return state.set('history', history);
      },

      async goBack(state: Object, inParam: Object, mutations: Object) {
        mutations.mutations.beforeGo({ count: -1, });
      },

      async goForward(state: Object, inParam: Object, mutations: Object) {
        mutations.mutations.beforeGo({ count: 1, });
      },
    },
  },
});

export const GoModel = model;
export const goBack = model.mutations.asyncGoBack;
export const goForward = model.mutations.asyncGoForward;
export const replace = model.mutations.beforeReplace;
export default model.mutations.beforeGo;
