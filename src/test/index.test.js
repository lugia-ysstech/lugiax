/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '../lib';
import { delay, } from '@lugia/react-test-utils';

const lugia = {};
describe('lugiax', () => {
  beforeEach(() => {
    lugiax.clear();
  });

  it('register normal', () => {
    const state = {
      name: 'ligx',
      pwd: '1',
    };
    const model = 'user';
    lugiax.register({
      model,
      state,
    });
    expect(lugiax.getState().toJS()).toEqual({ [model]: state, lugia, });
  });

  it('register mutil level state', () => {
    const state = {
      data: [
        {
          title: 'hello',
          value: 1,
        },
        {
          title: 'hello2',
          value: 2,
        },
      ],
    };
    const model = 'user';
    lugiax.register({
      model,
      state,
    });
    expect(
      lugiax
        .getState()
        .get(model)
        .get('data')
        .toJS()
    ).toEqual(state.data);
  });

  it('subscribeAll for force register', async () => {
    const state = {
      name: 'ligx',
      pwd: '2',
    };
    const model = 'user';
    const trigger = new Promise(res => {
      lugiax.subscribeAll(() => {
        res(state);
      });
    });

    lugiax.register({
      model,
      state,
    });

    lugiax.register(
      {
        model,
        state,
      },
      { force: true, }
    );
    expect(await trigger).toBe(state);
    expect(lugiax.getState().toJS()).toEqual({ [model]: state, lugia, });
  });

  it('subscribe model name is "user" for force register', async () => {
    const state = {
      name: 'ligx',
      pwd: '3',
    };
    let triggerCnt = 0;
    const model = 'user';
    const trigger = new Promise(res => {
      lugiax.subscribe(model, () => {
        triggerCnt++;
        res(state);
      });
    });
    lugiax.register({
      model,
      state,
    });
    const oldState = lugiax.getState().get(model);
    expect(oldState.toJS()).toEqual(state);
    const otherState = {
      name: 'king',
      pwd: '4',
    };
    const otherModel = model + 'other';
    lugiax.register({
      model: otherModel,
      state: otherState,
    });
    expect(lugiax.getState().get(model)).toBe(oldState);

    lugiax.register(
      {
        model,
        state,
      },
      { force: true, }
    );
    expect(lugiax.getState().get(model)).not.toBe(oldState);

    expect(lugiax.getState().toJS()[otherModel]).toEqual(otherState);

    expect(await trigger).toBe(state);
    expect(triggerCnt).toBe(1);
  });

  it('register repeact same model Error', () => {
    const state = {
      name: 'ligx',
      pwd: '5',
    };
    const model = 'user';
    lugiax.register({
      model,
      state,
    });
    expect(lugiax.getState().toJS()).toEqual({ [model]: state, lugia, });
    expect(() =>
      lugiax.register({
        model,
        state,
      })
    ).toThrow('重复注册模块');
    expect(lugiax.getState().toJS()).toEqual({ [model]: state, lugia, });
  });
  it('register force repeact same model ', () => {
    const state = {
      name: 'ligx',
      pwd: '6',
    };
    const model = 'user';
    lugiax.register({
      model,
      state,
    });
    expect(lugiax.getState().toJS()).toEqual({ [model]: state, lugia, });

    const newState = { name: 'kxy', pwd: '654321', };
    lugiax.register(
      {
        model,
        state: newState,
      },
      { force: true, }
    );
    expect(lugiax.getState().toJS()).toEqual({ [model]: newState, lugia, });
  });

  it('register force different  model ', () => {
    const state = {
      name: 'ligx',
      pwd: '7',
    };
    const model = 'user';
    lugiax.register({
      model,
      state,
    });
    expect(lugiax.getState().toJS()).toEqual({ [model]: state, lugia, });

    const newState = { no: '137', ad: 'Fuzhou', };
    lugiax.register({
      model: 'address',
      state: newState,
    });
    expect(lugiax.getState().toJS()).toEqual({
      address: newState,
      [model]: state,
      lugia,
    });
  });
  it('mutations for changeModel ', async () => {
    const state = {
      name: 'ligx',
      pwd: '9',
    };
    const model = 'user';

    const newName = '100';
    const newPwd = 'ligx';
    const otherModel = 'otherModel';
    const otherState = {
      hello: '无形',
    };
    lugiax.register({
      model: otherModel,
      state: otherState,
    });
    let syncMutations = { changePwd() {}, };
    const syncMutationPromise = new Promise(res => {
      syncMutations = {
        changePwd(modelData: Object) {
          res(true);
          return modelData.set('pwd', newPwd);
        },
      };
    });
    let asyncMutations = { async changeName() {}, };
    const asyncMutationPromise = new Promise(res => {
      asyncMutations = {
        async changeName(modelData: Object) {
          await delay(100);
          expect(lugiax.getState().get(model)).toBe(modelData);
          expect(modelData.toJS()).toEqual(state);
          res(true);
          return modelData.set('name', newName);
        },
      };
    });
    const obj = lugiax.register({
      model,
      state,
      mutations: {
        async: asyncMutations,
        sync: syncMutations,
      },
    });

    expect(lugiax.action2Process).toEqual({
      '@lugiax/user/async/changeName': {
        body: asyncMutations.changeName,
        modelName: model,
        type: 'async',
      },
      '@lugiax/user/sync/changePwd': {
        body: syncMutations.changePwd,
        modelName: model,
        type: 'sync',
      },
    });

    const { asyncChangeName, } = obj;
    let oldModelData = lugiax.getState().get(model);
    expect(asyncChangeName.mutationType).toBe('async');
    await asyncChangeName();
    await asyncMutationPromise;

    expect(lugiax.getState().get(model)).not.toBe(oldModelData);
    expect(lugiax.getState().get(otherModel)).not.toBe(otherState);
    expect(lugiax.getState().toJS()).toEqual({
      [model]: { pwd: state.pwd, name: newName, },
      lugia,
      [otherModel]: otherState,
    });

    const { changePwd, } = obj;
    expect(changePwd.mutationType).toBe('sync');

    oldModelData = lugiax.getState().get(model);

    changePwd();
    await syncMutationPromise;

    expect(lugiax.getState().get(model)).not.toBe(oldModelData);
    expect(lugiax.getState().get(otherModel)).not.toBe(otherState);
    expect(lugiax.getState().toJS()).toEqual({
      [model]: { pwd: newPwd, name: newName, },
      lugia,
      [otherModel]: otherState,
    });
  });

  it('asyncMutation name is only one letter', async () => {
    let mutation = () => {};
    const result = new Promise(res => {
      const { asyncH, } = lugiax.register({
        model: 'hello',
        state: {},
        mutations: {
          async: {
            async h() {
              res(true);
            },
          },
        },
      });
      mutation = asyncH;
    });
    await mutation();
    expect(await result).toBeTruthy();
  });

  it('doMutation  param and return undefined doMutation same model', async () => {
    const state = {
      name: '',
      pwd: '',
    };
    const model = 'login';
    const param = { name: 'ligx', pwd: 'hello', };
    let obj = {};

    const actionPromise = new Promise(res => {
      obj = lugiax.register({
        model,
        state,
        mutations: {
          async: {
            async login(modelData: Object, inParam: Object, { mutations, }) {
              const { changeUserInfo, } = mutations;
              expect(inParam).toBe(param);
              // login verify
              changeUserInfo(inParam);
            },
          },
          sync: {
            changeUserInfo(modelData: Object, inParam: Object) {
              res(true);
              return modelData.merge(inParam);
            },
          },
        },
      });
    });

    const { asyncLogin, } = obj;
    await asyncLogin(param);
    await actionPromise;
    expect(
      lugiax
        .getState()
        .get(model)
        .toJS()
    ).toEqual(param);
  });

  it('doMutation  param and return undefined doMutation same model', async () => {
    const state = {
      name: '',
      pwd: '',
    };
    const userModelName = 'user';
    const userInfoParam = { name: 'ligx', pwd: 'hello', };
    let loginModel = {};

    const actionPromise = new Promise(res => {
      const userModel = lugiax.register({
        model: userModelName,
        state,
        mutations: {
          sync: {
            changeUserInfo(modelData: Object, inParam: Object) {
              res(true);
              return modelData.merge(inParam);
            },
          },
        },
      });

      loginModel = lugiax.register({
        model: 'login',
        state: {},
        mutations: {
          async: {
            async login(modelData: Object, inParam: Object): Promise<any> {
              expect(inParam).toBe(userInfoParam);
              await delay(100);
              // login verify
              const { changeUserInfo, } = userModel;
              changeUserInfo(inParam);
            },
          },
        },
      });
    });

    const { asyncLogin, } = loginModel;
    await asyncLogin(userInfoParam);
    await actionPromise;

    expect(
      lugiax
        .getState()
        .get(userModelName)
        .toJS()
    ).toEqual(userInfoParam);
  });
});
