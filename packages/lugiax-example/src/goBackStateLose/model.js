import lugaix from '@lugia/lugiax';
import { go, goBack, } from '@lugia/lugiax-router';
import inputsModel1 from './model2';
const inputsState = {
  value: 0,
};
const modelName = 'inputsModel';
const inputsModel = lugaix.register({
  model: modelName,
  state: inputsState,
  mutations: {
    async: {
      async go(state, param) {
        go({ url: '/a', });
      },
      async setRecord(state, param) {
        return state.set('value', param);
      },
      async goBack() {
        inputsModel1.destroy();
        // goBack();
      },
    },
  },
});
export default inputsModel;
