/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '../src/index';
import login from './login';
import user from './user';

describe('lugiax', () => {
  it('import model result', () => {
    expect(
      lugiax
        .getState()
        .get(login.model)
        .toJS()
    ).toEqual({
      name: 'ligx',
      pwd: '123456',
    });
    expect(
      lugiax
        .getState()
        .get(user.model)
        .toJS()
    ).toEqual({
      name: 'kxy',
      age: 15,
    });
  });
});
