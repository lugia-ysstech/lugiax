import lugaix from '@lugia/lugiax';
import {fromJS,} from 'immutable';

const userState = {
  peoples: [
    { id: '5', name: '5', age: 18, hobby: '睡觉', },
    { id: '6', name: '6', age: 18, hobby: '打游戏', },
    { id: '7', name: '7', age: 18, hobby: '看电视', },
    { id: '8', name: '8', age: 18, hobby: '看小说', },
  ],
};
const modelName = 'userInfo';

lugaix.setMutationTimeOut (2000);

export const userModel = lugaix.register({
  model: modelName,
  state: userState,
  mutations: {
    sync: {
      removePeopleById(state, inpar, { mutations, getState, }) {
        mutations.removePeopleByIndex(1);
        state = getState();
        const list = state.get('peoples');
        const newList = list.filter(item => {
          return item.get('id') != inpar.id;
        });
        console.log('====?newList',newList.toJS());
        return state.set('peoples', newList);
      },
      removePeopleByIndex(state, inpar, { mutations, }) {
        const list = state.get('peoples');
        return state.set('peoples', list.splice(inpar,1));
      },
    },
    async: {
      async getPeoples(state, inpar, { mutations, getState, }) {
        const data = await new Promise(reslove => {
          setTimeout(() => {
            reslove({
              result: 'ok', data: [
                { id: '1', name: '小名', age: 18, hobby: '睡觉', },
                { id: '2', name: '小王', age: 18, hobby: '打游戏', },
                { id: '3', name: '小张', age: 18, hobby: '看电视', },
                { id: '4', name: '小李', age: 18, hobby: '看小说11', },
              ],
            });
          }, 61000);
        });
        if (data.result === 'ok') {
          const s = getState().set('peoples', fromJS(data.data));
          return s;
        }
      },
      async  removePeopleById(state, inpar, { mutations, }) {
        lugaix.clearRenderQueue();
        const list = state.get('peoples');
        const newList = list.filter(item => {
          return item.get('id') != inpar.id;
        });
        return state.set('peoples', newList);
      },
    },
  },
});
