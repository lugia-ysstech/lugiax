// model.js
import lugaix from '@lugia/lugiax';
const titleState = {
  title: '一个测试用例',
  pwd: '222',
};
let modelName = 'testTitle';
const titleModel = lugaix.register({
  model: modelName,
  state: titleState,
});

modelName = 'MutationsIsNull';
const mutationsIsNull = lugaix.register({
  model: modelName,
  state: titleState,
  mutations: null,
});

modelName = 'MutationsIsUndefined';
const mutationsIsUndefined = lugaix.register({
  model: modelName,
  state: titleState,
  mutations: undefined,
});
export { mutationsIsNull, titleModel, mutationsIsUndefined };
