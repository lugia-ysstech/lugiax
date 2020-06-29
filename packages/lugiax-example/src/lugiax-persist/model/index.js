// model.js
import lugaix from '@lugia/lugiax';
import wrapPersistence from '@lugia/lugiax-persistence';
const userState = {
  peoples: [
    { id: '1', name: '小名', age: 18, hobby: '睡觉', },
    { id: '2', name: '小王', age: 18, hobby: '打游戏', },
    { id: '3', name: '小张', age: 18, hobby: '看电视', },
    { id: '4', name: '小李', age: 18, hobby: '看小说', },
  ],
};
const modelName = 'userInfo';
export const userModel = lugaix.register(
  wrapPersistence({
    model: modelName,
    state: userState,
    mutations: {
      sync: {
        // 同步删除方法
        removePeopleById(state, inpar, { mutations, }) {
          // 获取的数据类型为 Immutable
          const list = state.get('peoples');
          // Immutable数据的操作方法请参考官网
          const newList = list.filter(item => {
            return item.get('id') != inpar.id;
          });
          return state.set('peoples', newList);
        },
      },
      async: {
        // 异步删除方法。这里用setTimeout代表异步ajax请求。请求删除数据
        async removePeopleById(state, inpar, { mutations, getState, }) {
          const data = await new Promise(reslove => {
            setTimeout(() => {
              reslove({ result: 'ok', });
            }, 1000);
          });
          if (data.result === 'ok') {
            // mutations.removePeopleById调用过后会返回最新的state,
            // 这里一定要返回最新的state。
            // state = mutations.removePeopleById(inpar);
            // 或者调用完mutation方法后使用getState方法获取最新的state并返回
            mutations.removePeopleById(inpar);
            state = getState();
          }
          return state;
        },
      },
    },
  })
);
