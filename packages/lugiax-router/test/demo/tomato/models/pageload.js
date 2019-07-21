/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';

const model = 'pageload';
const state = {
  load: false,
};

export default lugiax.register({
  model,
  state,
  mutations: {
    sync: {
      pageLoad(state: Object) {
        return state.set('load', true);
      },
      pageUnLoad(state: Object) {
        return state.set('load', false);
      },
    },
  },
});
