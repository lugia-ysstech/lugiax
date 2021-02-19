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
    const name = 'initName';
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

  it('globalMutationTimeOut is work', async () => {
    const model = 'user';
    const name = 'initName';
    const pwd = '123456';
    const state = {
      name,
      pwd,
    };
    lugiax.setMutationTimeOut(500);
    const {
      mutations: { asyncChangeUserName, },
    } = lugiax.register({
      model,
      state,
      mutations: {
        async: {
          async changeUserName(data: Object, inParam: Object, {getState,}) {
            await delay(10000);
            data = getState();
            return data.set('name', inParam.name);
          },
        },
      },
    });
    const res = await asyncChangeUserName({ name: 'ligx', });
    expect(lugiax.getState(model).toJS()).toEqual({
      lugia: { loading: { user: false, }, },
      user: { name, pwd, },
    });
  });

  it('modelMutationTimeout is work', async () => {
    const model = 'user';
    const name = 'initName';
    const pwd = '123456';
    const state = {
      name,
      pwd,
    };
    const {
      mutations: { asyncChangeUserName, },
    } = lugiax.register({
      model,
      state,
      mutations: {
        async: {
          async changeUserName(data: Object, inParam: Object, {getState,}) {
            await delay(10000);
            data = getState();
            return data.set('name', inParam.name);
          },
        },
      },
    },{
      modelMutationTimeOut: 500,
    });
    const res = await asyncChangeUserName({ name: 'ligx', });
    expect(lugiax.getState(model).toJS()).toEqual({
      lugia: { loading: { user: false, }, },
      user: { name, pwd, },
    });
  });

  it( 'more mutationTimeout', async () => {
    const model = 'user';
    const name = 'initName';
    const pwd = '123456';
    const state = {
      name,
      pwd,
    };
    const {
      mutations: { asyncChangeUserName, asyncChangePwd, },
    } = lugiax.register({
      model,
      state,
      mutations: {
        async: {
          async changeUserName(data: Object, inParam: Object, {getState,}) {
            await delay(10000);
            data = getState();
            return data.set('name', inParam.name);
          },
          async changePwd(data: Object, inParam: Object, {getState,}) {
            await delay(200);
            data = getState();
            return data.set('pwd', inParam.pwd);
          },
        },
        asyncTimeoutConfig:{
          changeUserName: 500,
        },
      },
    });
    await asyncChangeUserName({ name: 'ligx', });
    await asyncChangePwd({pwd: 'xxxx',});
    expect(lugiax.getState(model).toJS()).toEqual({
      lugia: { loading: { user: false, }, },
      user: { name, pwd:'xxxx', },
    });
  });


  it( 'lugiax clearRenderQueue function is work', async () => {
    const model = 'user';
    const name = 'initName';
    const pwd = '123456';
    const state = {
      name,
      pwd,
    };
    const {
      mutations: { asyncChangeUserName, asyncChangePwd, },
    } = lugiax.register({
      model,
      state,
      mutations: {
        async: {
          async changeUserName(data: Object, inParam: Object, {getState,}) {
            await delay(2000);
            data = getState();
            return data.set('name', inParam.name);
          },
          async changePwd(data: Object, inParam: Object, {getState,}) {
            await delay(2000);
            data = getState();
            return data.set('pwd', inParam.pwd);
          },
        },
      },
    });
    const allResult = Promise.all( [asyncChangeUserName({ name: 'ligx', }) , asyncChangePwd({pwd: 'xxxx',}),] );
    lugiax.clearRenderQueue();
    await allResult;
    expect(lugiax.getState(model).toJS()).toEqual({
      lugia: { loading: { user: false, }, },
      user: { name, pwd, },
    });
  });

});
