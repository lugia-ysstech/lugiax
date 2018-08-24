/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';

const model = 'user';
const name = 'kxy';
const age = 15;
const state = {
  name,
  age,
};

function generateMutation(field) {
  return {
    [`change${field.substr(0, 1).toUpperCase() + field.substr(1)}`](
      data,
      param
    ) {
      return data.set(field, param[field]);
    },
  };
}

const userModel = lugiax.register({
  model,
  state,
  mutations: {
    sync: Object.assign(generateMutation('age'), generateMutation('name')),
  },
});
console.info('uesr', lugiax.getState().toJS());

export default userModel;
