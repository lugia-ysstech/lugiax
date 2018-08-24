/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '../lib/index';
import user from './user';
import login from './login';

describe('lugiax', () => {
  it('import model result', () => {
    expect(
      lugiax
        .getState()
        .get(user.model)
        .toJS()
    ).toEqual({
      name: 'kxy',
      age: 15,
    });
    expect(
      lugiax
        .getState()
        .get(login.model)
        .toJS()
    ).toEqual({
      name: 'ligx',
      pwd: '123456',
    });
  });
});
