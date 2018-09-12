/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax-core';
import { push, } from 'connected-react-router';

const model = lugiax.register({
  model: '@lugiax/router',
  state: {
    history: [],
  },
  mutations: {
    async: {
      async beforeGo(state: Object) {
        return state;
      },
      async go(state: Object, inParam: Object) {
        const store = lugiax.getStore();
        const { url, } = inParam;
        store.dispatch(push(url));
        let history = state.get('history');
        history = history.push(url);
        return state.set('history', history);
      },
    },
  },
});
export const GoModel = model;
export default model.mutations.asyncBeforeGo;
