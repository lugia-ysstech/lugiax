/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';

const model = 'user';
const name = 'ligx';
const pwd = '123456';
const state = {
  name,
  pwd,
};
export default lugiax.register({
  model,
  state,
  mutations: {
    sync: {
      changeName(data: Object, inParam: Object) {
        return data.set('name', inParam.name);
      },
    },
    async: {
      async changePwd(data: Object, inParam: Object) {
        return data.set('pwd', inParam.pwd);
      },
    },
  },
});
