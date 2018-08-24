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

export default loginModel;
