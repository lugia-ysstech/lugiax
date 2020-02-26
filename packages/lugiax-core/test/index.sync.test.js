/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '../src/index';
import { delay, } from '@lugia/react-test-utils';

describe('lugiax.sync', () => {
  beforeEach(() => {
    lugiax.clear();
  });


  it('async and sync mutation has getState', async () => {
    const model = 'user';
    const name = 'ligx';
    const pwd = '123456';
    const state = {
      name,
      pwd,
    };
    const {
      mutations: { changePassword, asyncChangeUserName, },
    } = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changePassword(data: Object, inParam: Object, { getState, }) {
            data = getState();
            return data.set('pwd', inParam.pwd);
          },
        },
        async: {
          async changeUserName(data: Object, inParam: Object, {getState,}) {
            await delay(100);
            data = getState();
            return data.set('name', inParam.name);
          },
        },
      },
    });
    const res = asyncChangeUserName({ name: 'ligx', });
    changePassword({ pwd: '654321', });
    await res;
    expect(lugiax.getState(model).toJS()).toEqual({
      lugia: { loading: { user: false, }, },
      user: { name: 'ligx', pwd: '654321', },
    });
  });
});
