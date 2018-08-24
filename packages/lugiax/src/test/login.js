/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '../lib';

const model = 'login';
const name = 'ligx';
const pwd = '123456';
const state = {
  name,
  pwd,
};
const loginModel = lugiax.register({
  model,
  state,
});
console.info('login', lugiax.getState().toJS());

export default loginModel;
