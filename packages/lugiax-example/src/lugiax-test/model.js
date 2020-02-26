import lugaix from '@lugia/lugiax';
const inputsState = {
  inputA: 'inputA',
  inputB: 'inputB',
  inputC: 'inputC',
  inputD: 'inputD',
};
const modelName = 'inputsModel';
const inputsModel = lugaix.register({
  model: modelName,
  state: inputsState,
  mutations: {
    sync: {
      changeInputA(data: Object, value: string) {
        return data.set('inputA', value);
      },
      changeInputB(data: Object, value: string) {
        return data.set('inputB', value);
      },
      changeInputC(data: Object, value: string) {
        return data.set('inputC', value);
      },
      changeInputD(data: Object, value: string) {
        return data.set('inputD', value);
      },
    },
  },
});
export default inputsModel;
