// model.js
import lugaix from '@lugia/lugiax';
const userModelName = 'userModel';
const subjectModelName = 'subjectModel';
const schoolModelName = 'schoolModel';

const userState = {
  peoples: [],
};
const subjectState = {
  subject: [],
};
const schoolState = {
  schoolInfo: {},
};

export const userModel = lugaix.persistStoreRegister({
  model: userModelName,
  state: userState,
  mutations: {
    async: {
      // 这里用setTimeout代表异步ajax请求
      async getPeoples(state, inpar, { mutations, getState, }) {
        const data = await new Promise(reslove => {
          const peoples = [
            { id: '1', name: '小名', age: 18, hobby: '睡觉', },
            { id: '2', name: '小王', age: 18, hobby: '打游戏', },
            { id: '3', name: '小张', age: 18, hobby: '看电视', },
            { id: '4', name: '小李', age: 18, hobby: '看小说', },
          ];
          setTimeout(() => {
            reslove({ result: 'ok', data: peoples, });
          }, 1000);
        });
        if (data.result === 'ok') {
          // 更新state是一定要获取最新的state
          state = getState();
          return state.set('peoples', data.data);
        }
      },
    },
  },
});

export const subjectModel = lugaix.persistStoreRegister({
  model: subjectModelName,
  state: subjectState,
  mutations: {
    async: {
      // 这里用setTimeout代表异步ajax请求
      async getSubject(state, inpar, { mutations, getState, }) {
        const subject = [
          '理学',
          '工学',
          '文学',
          '艺术学',
          '历史学',
          '哲学',
          '经济学',
          '管理学',
          '法学',
          '教育学',
        ];
        const data = await new Promise(reslove => {
          setTimeout(() => {
            reslove({ result: 'ok', data: subject, });
          }, 1000);
        });
        if (data.result === 'ok') {
          // 更新state是一定要获取最新的state
          state = getState();
          return state.set('subject', data.data);
        }
      },
    },
  },
});

export const schoolModel = lugaix.register({
  model: schoolModelName,
  state: schoolState,
  mutations: {
    async: {
      // 这里用setTimeout代表异步ajax请求
      async getsChoolInfo(state, inpar, { mutations, getState, }) {
        const schoolInfo = {
          name: '北京清华大学',
          schoolMotto: '自强不息,厚德载物',
          address: '北京市海淀区双清路30号。',
        };
        const data = await new Promise(reslove => {
          setTimeout(() => {
            reslove({ result: 'ok', data: schoolInfo, });
          }, 1000);
        });
        if (data.result === 'ok') {
          // 更新state是一定要获取最新的state
          state = getState();
          return state.set('schoolInfo', data.data);
        }
      },
    },
  },
});
