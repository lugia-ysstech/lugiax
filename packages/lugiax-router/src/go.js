/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';
function getUrl(inParam: Object) {
  return typeof inParam === 'string' ? inParam : inParam.url;
}
const model = lugiax.register({
  model: '@lugiax/router',
  state: {},
  mutations: {
    sync: {
      beforeGo(state: Object) {
        return state;
      },
      beforeReplace(state: Object) {
        return state;
      },

      go(state: Object, inParam: Object) {
        const url = getUrl(inParam);
        const { history, } = inParam;
        if (!history) {
          return state;
        }
        if (url) {
          history.push(url);
          return state;
        }

        const { count, } = inParam;
        const goIndex = Math.floor(count);
        if (isNaN(goIndex)) {
          return state;
        }

        history.go(count);
        return state;
      },
      replace(state: Object, inParam: Object) {
        const url = getUrl(inParam);
        const { history, } = inParam;
        history.replace(url);
        return state;
      },

      goBack(state: Object, inParam: Object, mutations: Object) {
        mutations.mutations.beforeGo({ count: -1, });
      },

      goForward(state: Object, inParam: Object, mutations: Object) {
        mutations.mutations.beforeGo({ count: 1, });
      },
    },
  },
});

export const GoModel = model;
export const goBack = model.mutations.goBack;
export const goForward = model.mutations.goForward;
export const replace = model.mutations.beforeReplace;
export default model.mutations.beforeGo;
