/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '../lib';

const model = 'user';
const name = 'kxy';
const age = 15;
const state = {
  name,
  age,
};

const userModel = lugiax.register({
  model,
  state,
});

export default userModel;
