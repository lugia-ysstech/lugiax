import lugaix from '@lugia/lugiax';
import { go, goBack, } from '@lugia/lugiax-router';
import inputsModel from './otherModel';
const inputsState = {
  value: 1212,
};
const modelName = 'inputsMode2222l';
const inputsModel1 = lugaix.register({
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
        goBack();
      },
    },
  },
});
export default inputsModel1;
