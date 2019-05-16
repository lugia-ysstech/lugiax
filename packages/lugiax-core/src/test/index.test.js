/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '../lib/index';
import { delay, } from '@lugia/react-test-utils';
import { fromJS, } from 'immutable';

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
    expect(lugiax.getState().toJS()).toEqual({
      [model]: state,
      lugia: {
        loading: { user: false, },
      },
    });
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
    expect(lugiax.getState().toJS()).toEqual({
      [model]: state,
      lugia: {
        loading: {
          [model]: false,
        },
      },
    });
  });

  it('subscribe model name is "user" for force register', async () => {
    const state = {
      name: 'ligx',
      pwd: '3',
    };
    let triggerCnt = 0;
    const model = 'user';
    const old = lugiax.getState().get(model);
    const trigger = new Promise(res => {
      lugiax.subscribe(model, (state, old) => {
        triggerCnt++;
        expect(old).toBe(old);
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

    expect(await trigger).toBe(lugiax.getState().get(model));
    expect(triggerCnt).toBe(1);
  });

  it('register repeact same model Error', () => {
    const state = {
      name: 'ligx',
      pwd: '5',
    };
    const model = 'user';
    const { getState, } = lugiax.register({
      model,
      state,
    });
    expect(getState().toJS()).toEqual(state);
    expect(lugiax.getState().toJS()).toEqual({
      [model]: state,
      lugia: {
        loading: {
          [model]: false,
        },
      },
    });
    expect(() =>
      lugiax.register({
        model,
        state,
      })
    ).toThrow('重复注册模块');
    expect(lugiax.getState().toJS()).toEqual({
      [model]: state,
      lugia: {
        loading: {
          [model]: false,
        },
      },
    });
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
    expect(lugiax.getState().toJS()).toEqual({
      [model]: state,
      lugia: {
        loading: {
          [model]: false,
        },
      },
    });

    const newState = { name: 'kxy', pwd: '654321', };
    lugiax.register(
      {
        model,
        state: newState,
      },
      { force: true, }
    );
    expect(lugiax.getState().toJS()).toEqual({
      [model]: newState,
      lugia: {
        loading: {
          [model]: false,
        },
      },
    });
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
    expect(lugiax.getState().toJS()).toEqual({
      [model]: state,
      lugia: {
        loading: {
          [model]: false,
        },
      },
    });

    const newState = { no: '137', ad: 'Fuzhou', };
    const addressModel = 'address';
    lugiax.register({
      model: addressModel,
      state: newState,
    });
    expect(lugiax.getState().toJS()).toEqual({
      address: newState,
      [model]: state,
      lugia: {
        loading: {
          [model]: false,
          [addressModel]: false,
        },
      },
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
    expect(obj.getState().toJS()).toEqual(state);

    const changeNameId = '@lugiax/user/async/changeName';
    const changePwdId = '@lugiax/user/sync/changePwd';
    expect(lugiax.mutationId2MutationInfo).toEqual({
      [changeNameId]: {
        body: asyncMutations.changeName,
        model,
        mutationId: changeNameId,
        type: 'async',
      },
      [changePwdId]: {
        mutationId: changePwdId,
        body: syncMutations.changePwd,
        model,
        type: 'sync',
      },
    });

    const {
      mutations: { asyncChangeName, },
    } = obj;
    let oldModelData = lugiax.getState().get(model);
    expect(asyncChangeName.mutationType).toBe('async');
    expect(asyncChangeName.mutationId).toBe(changeNameId);
    await asyncChangeName();
    await asyncMutationPromise;

    expect(lugiax.getState().get(model)).not.toBe(oldModelData);
    expect(lugiax.getState().get(otherModel)).not.toBe(otherState);
    expect(lugiax.getState().toJS()).toEqual({
      [model]: { pwd: state.pwd, name: newName, },
      lugia: { loading: { [obj.model]: false, [otherModel]: false, }, },
      [otherModel]: otherState,
    });

    const {
      mutations: { changePwd, },
    } = obj;
    expect(changePwd.mutationType).toBe('sync');

    oldModelData = lugiax.getState().get(model);

    changePwd();
    await syncMutationPromise;

    expect(lugiax.getState().get(model)).not.toBe(oldModelData);
    expect(lugiax.getState().get(otherModel)).not.toBe(otherState);
    expect(lugiax.getState().toJS()).toEqual({
      [model]: { pwd: newPwd, name: newName, },
      lugia: { loading: { [obj.model]: false, [otherModel]: false, }, },
      [otherModel]: otherState,
    });
  });

  it('asyncMutation name is only one letter', async () => {
    let mutation = () => {};
    const result = new Promise(res => {
      const {
        mutations: { asyncH, },
      } = lugiax.register({
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

  it('doAsyncMutation  param and return undefined doAsyncMutation same model', async () => {
    const state = {
      name: '',
      pwd: '',
    };
    const model = 'login';
    const param = { name: 'ligx', pwd: 'hello', };
    let obj = {};

    const mutationPromise = new Promise(res => {
      obj = lugiax.register({
        model,
        state,
        mutations: {
          async: {
            async login(modelData: Object, inParam: Object, { mutations, }) {
              //
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

    const {
      mutations: { asyncLogin, },
    } = obj;
    await asyncLogin(param);
    await mutationPromise;
    expect(
      lugiax
        .getState()
        .get(model)
        .toJS()
    ).toEqual(param);
  });

  it('doAsyncMutation  param and return undefined doAsyncMutation same model', async () => {
    const state = {
      name: '',
      pwd: '',
    };
    const loginModelName = 'login';
    const userModelName = 'user';
    const userInfoParam = { name: 'ligx', pwd: 'hello', };
    let loginModel = {};

    const mutationPromise = new Promise(res => {
      const userModel = lugiax.register({
        model: userModelName,
        state,
        mutations: {
          sync: {
            changeUserInfo(modelData: Object, inParam: Object) {
              const loading = lugiax
                .getState()
                .get('lugia')
                .get('loading')
                .get(userModelName);
              expect(loading).toBeTruthy();

              res(true);
              return modelData.merge(inParam);
            },
          },
        },
      });

      loginModel = lugiax.register({
        model: loginModelName,
        state: {},
        mutations: {
          async: {
            async login(modelData: Object, inParam: Object): Promise<any> {
              expect(
                lugiax
                  .getState()
                  .get('lugia')
                  .get('loading')
                  .get(loginModelName)
              ).toBeTruthy();
              expect(
                lugiax
                  .getState()
                  .get('lugia')
                  .get('loading')
                  .get(userModelName)
              ).toBeFalsy();
              expect(inParam).toBe(userInfoParam);
              await delay(100);
              // login verify
              const {
                mutations: { changeUserInfo, },
              } = userModel;
              changeUserInfo(inParam);
              expect(
                lugiax
                  .getState()
                  .get('lugia')
                  .get('loading')
                  .get(userModelName)
              ).toBeFalsy();
            },
          },
        },
      });
    });

    const {
      mutations: { asyncLogin, },
    } = loginModel;
    await asyncLogin(userInfoParam);
    await mutationPromise;
    expect(
      lugiax
        .getState()
        .get('lugia')
        .get('loading')
        .get(loginModelName)
    ).toBeFalsy();
    expect(
      lugiax
        .getState()
        .get('lugia')
        .get('loading')
        .get(userModelName)
    ).toBeFalsy();
    expect(
      lugiax
        .getState()
        .get(userModelName)
        .toJS()
    ).toEqual(userInfoParam);
  });

  it('only immutable', async () => {
    const state = {
      name: '',
      pwd: '',
    };
    const model = 'login';
    const actualFlow = [];

    const {
      mutations: { asyncHello, },
    } = lugiax.register({
      model,
      state,
      mutations: {
        async: {
          async hello(modelData: Object, inParam: Object) {
            actualFlow.push(inParam);
            return { hello: '1223', };
          },
        },
      },
    });
    await asyncHello();
    expect(
      lugiax
        .getState()
        .get(model)
        .get('hello')
    ).toBe('1223');
  });

  it('wait mutation in  same model', async () => {
    const model = 'login';
    const actualFlow = [];
    const helloState = { hello: '1223', };
    const sayState = { say: '1223', };
    const okState = { ok: '1223', };
    const expectEmptyObject = function() {
      expect(
        lugiax
          .getState()
          .get(model)
          .toJS()
      ).toEqual({});
    };
    const expectSayState = function() {
      expect(
        lugiax
          .getState()
          .get(model)
          .toJS()
      ).toEqual(sayState);
    };
    const expectHelloState = function() {
      expect(
        lugiax
          .getState()
          .get(model)
          .toJS()
      ).toEqual(helloState);
    };
    const target = lugiax.register({
      model,
      state: {},
      mutations: {
        sync: {
          ok(modelData: Object, inParam: Object) {
            expectEmptyObject();
            actualFlow.push(inParam);
            return okState;
          },
        },
        async: {
          async waitHello(
            modelData: Object,
            inParam: Object,
            { mutations, wait, }
          ) {
            expectEmptyObject();
            const { asyncHello, } = mutations;
            actualFlow.push(await wait(asyncHello));
            expectHelloState();
            actualFlow.push(inParam);
          },
          async hello(modelData: Object, inParam: Object, { wait, mutations, }) {
            actualFlow.push(inParam);
            expectEmptyObject();
            const { asyncSay, } = mutations;
            actualFlow.push(await wait(asyncSay));
            expectSayState();
            return helloState;
          },
          async say(modelData: Object, inParam: Object, { wait, mutations, }) {
            const { ok, } = mutations;
            expectEmptyObject();
            await wait(ok);
            actualFlow.push(inParam);
            expect(
              lugiax
                .getState()
                .get(model)
                .toJS()
            ).toEqual(okState);
            return sayState;
          },
        },
      },
    });

    const {
      mutations: { ok, asyncSay, asyncHello, asyncWaitHello, },
    } = target;

    delay(50, async () => {
      await asyncHello({ index: 2, });
    });

    delay(100, async () => {
      await asyncSay({ index: 3, });
    });
    delay(150, async () => {
      await ok({ index: 5, });
    });

    await asyncWaitHello({ index: 1, });
    expect(actualFlow).toEqual([
      { index: 2, },
      { index: 5, },
      { index: 3, },
      { index: 3, },
      { index: 2, },
      { index: 1, },
    ]);
  });
  it('wait mutation in different model', async () => {
    const helloModelName = 'hello';
    const waitModelName = 'login';
    const actualFlow = [];
    const helloState = { hello: '1223', };
    const sayState = { say: '1223', };
    const hello = lugiax.register({
      model: helloModelName,
      state: {},
      mutations: {
        async: {
          async hello(modelData: Object, inParam: Object, { wait, mutations, }) {
            actualFlow.push(inParam);
            const { asyncSay, } = mutations;
            actualFlow.push(await wait(asyncSay));
            expect(
              lugiax
                .getState()
                .get(helloModelName)
                .toJS()
            ).toEqual(sayState);
            return helloState;
          },
          async say(modelData: Object, inParam: Object) {
            actualFlow.push(inParam);
            return sayState;
          },
        },
      },
    });

    const wait = lugiax.register({
      model: waitModelName,
      state: {},
      mutations: {
        async: {
          async waitHello(
            modelData: Object,
            inParam: Object,
            { mutations, wait, }
          ) {
            const {
              mutations: { asyncHello, },
            } = hello;
            expect(
              lugiax
                .getState()
                .get(helloModelName)
                .toJS()
            ).toEqual({});
            actualFlow.push(await wait(asyncHello));
            expect(
              lugiax
                .getState()
                .get(helloModelName)
                .toJS()
            ).toEqual(helloState);
            actualFlow.push(inParam);
          },
        },
      },
    });

    const {
      mutations: { asyncWaitHello, },
    } = wait;
    const {
      mutations: { asyncSay, asyncHello, },
    } = hello;

    delay(100, async () => {
      await asyncHello({ index: 2, });
    });

    delay(200, async () => {
      await asyncSay({ index: 3, });
    });

    await asyncWaitHello({ index: 1, });
    expect(actualFlow).toEqual([
      { index: 2, },
      { index: 3, },
      { index: 3, },
      { index: 2, },
      { index: 1, },
    ]);
  });
  it('on all', async () => {
    const loginModelName = 'login';
    const loginModel = lugiax.register({
      state: {},
      model: loginModelName,
      mutations: {
        sync: {
          ok() {},
        },
        async: {
          async loginSuccess() {},
        },
      },
    });
    const {
      mutations: { asyncLoginSuccess, ok, },
    } = loginModel;

    const menuModelName = 'menu';
    const menuModel = lugiax.register({
      state: {},
      model: menuModelName,
      mutations: {
        async: {
          async fetchMenus() {},
        },
      },
    });
    const {
      mutations: { asyncFetchMenus, },
    } = menuModel;
    const loginParam = {
      hello: 'world',
    };
    const menusParam = {
      hello: 'ligx',
    };

    const waitResult = new Promise((res, reject) => {
      const result = [];
      lugiax.on(
        async (mutation: Object, param: Object, { mutations, wait, }) => {
          result.push(param);
          switch (result.length) {
            case 1:
              expect(mutation).toBe(asyncLoginSuccess);
              expect(mutations).toBe(loginModel.mutations);
              break;
            case 2:
              expect(mutations).toBe(menuModel.mutations);
              expect(mutation).toBe(asyncFetchMenus);
              break;
            default:
          }

          if (result.length === 2) {
            await wait(ok);
            res(result);
          }
          if (result.length > 2) {
            throw new Error('消息过多错误');
          }
        }
      );
    });
    const okParam = { ok: 'ok', };
    await asyncLoginSuccess(loginParam);
    await asyncFetchMenus(menusParam);
    await delay(100, async () => {
      ok(okParam);
    });
    expect(await waitResult).toEqual([loginParam, menusParam, okParam,]);
  });
  it('mutation param.value is null', () => {
    const {
      model,
      state: { name, },
      lugiaxModel: {
        mutations: { changeName, },
      },
    } = createTestModel();

    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe(name);
    changeName({ name: '', });
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe('');

    function reset() {
      changeName({ name, });
      expect(
        lugiax
          .getState()
          .get(model)
          .get('name')
      ).toBe(name);
    }

    reset();
    changeName({ name: null, });
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe(null);

    reset();

    changeName({ name: undefined, });
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe(undefined);
  });

  it('subscribe for sync mutations', async () => {
    const {
      model,
      state,
      lugiaxModel: {
        mutations: { changeName, },
      },
    } = createTestModel();

    const newName = 'hello new name';
    const oldState = lugiax.getState().get(model);

    expect(oldState.toJS()).toEqual(state);
    const subscribe = new Promise(res => {
      lugiax.subscribe(model, (state, old) => {
        expect(lugiax.getState().get(model)).toBe(state);
        expect(old).toBe(oldState);
        res(true);
      });
    });
    changeName({ name: newName, });

    await subscribe;
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toEqual(newName);
  });

  it('subscribe for sync mutations unsubscribe', async () => {
    const {
      model,
      state,
      lugiaxModel: {
        mutations: { changeName, },
      },
    } = createTestModel();

    const newName = 'hello new name';
    const oldState = lugiax.getState().get(model);

    expect(oldState.toJS()).toEqual(state);
    let change = false;
    const { unSubscribe, } = lugiax.subscribe(model, () => {
      change = true;
    });
    unSubscribe();
    changeName({ name: newName, });

    expect(change).toBeFalsy();
  });
  it('subscribe for sync mutations for null', async () => {
    const {
      model,
      state,
      lugiaxModel: {
        mutations: { changeName, },
      },
    } = createTestModel();
    const oldState = lugiax.getState().get(model);

    expect(oldState.toJS()).toEqual(state);
    const subscribe = new Promise(res => {
      lugiax.subscribe(model, (state, old) => {
        expect(lugiax.getState().get(model)).toBe(state);
        expect(old).toBe(oldState);
        res(true);
      });
    });
    changeName({ name: null, });

    await subscribe;
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toEqual(null);
  });
  it('addMutation is exist mutationName', async () => {
    const mutationName = 'changeName';
    const { model, lugiaxModel, } = createTestModel();
    expect(() =>
      lugiaxModel.addMutation(mutationName, (data: Object, inParam: Object) => {
        return data.set('name', inParam.name);
      })
    ).toThrow(`The sync [${model}.${mutationName}] is exist model!`);
  });

  it('addMutation', async () => {
    const mutationName = 'sdp';
    const { model, lugiaxModel, } = createTestModel();

    const targetAttr = 'name';
    const newValue = '寄蜉蝣于天地';
    lugiaxModel.addMutation(mutationName, (data: Object, inParam: Object) => {
      return data.set(targetAttr, newValue);
    });
    const {
      mutations: { sdp, },
    } = lugiaxModel;
    sdp();
    expect(
      lugiax
        .getState()
        .get(model)
        .get(targetAttr)
    ).toBe(newValue);
  });

  it('addAsyncMutation', async () => {
    const mutationName = 'sdp';
    const { model, lugiaxModel, } = createTestModel();

    const targetAttr = 'name';
    const newValue = '寄蜉蝣于天地';
    lugiaxModel.addAsyncMutation(
      mutationName,
      async (data: Object, inParam: Object) => {
        return data.set(targetAttr, newValue);
      }
    );
    const {
      mutations: { asyncSdp, },
    } = lugiaxModel;
    await asyncSdp();
    expect(
      lugiax
        .getState()
        .get(model)
        .get(targetAttr)
    ).toBe(newValue);
  });

  it('addAsyncMutation is exist mutationName', async () => {
    const mutationName = 'changePwd';
    const { model, lugiaxModel, } = createTestModel();
    expect(() =>
      lugiaxModel.addAsyncMutation(
        mutationName,
        (data: Object, inParam: Object) => {
          return data.set('name', inParam.name);
        }
      )
    ).toThrow(`The async [${model}.${mutationName}] is exist model!`);
  });

  function createTestModel() {
    const model = 'user';
    const name = 'ligx';
    const pwd = '123456';
    const state = {
      name,
      pwd,
    };
    return {
      model,
      lugiaxModel: lugiax.register({
        model,
        state,
        mutations: {
          sync: {
            changeName(data: Object, inParam: Object) {
              return data.set('name', inParam.name);
            },
          },
          async: {
            changePwd(data: Object, inParam: Object) {
              return data.set('name', inParam.name);
            },
            changeForPwd(data: Object, inParam: Object) {
              return data.set('pwd', inParam.pwd);
            },
          },
        },
      }),
      state,
    };
  }

  it('mutation return is not a immutable', () => {
    const model = 'user';
    const name = 'ligx';
    const pwd = '123456';
    const state = {
      name,
      pwd,
    };
    const {
      mutations: { changeName, hello, hi, },
    } = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName(data: Object, inParam: Object) {
            return { name: 'hello', pwd: 'abc', };
          },
          hello() {
            return null;
          },
          hi() {},
        },
      },
    });
    expect(changeName().toJS()).toEqual({ name: 'hello', pwd: 'abc', });
    expect(changeName()).toEqual(lugiax.getState().get(model));
    expect(hello()).toEqual(lugiax.getState().get(model));
    expect(hi()).toEqual(lugiax.getState().get(model));
  });

  it('mutation return null or undefined', () => {});

  it('sync mutation return state', () => {
    const {
      lugiaxModel: {
        mutations: { changeName, },
      },
    } = createTestModel();
    expect(changeName({ name: 'hello', }).toJS()).toEqual({
      name: 'hello',
      pwd: '123456',
    });
  });
  it('async mutation return state', async () => {
    const {
      lugiaxModel: {
        mutations: { asyncChangeForPwd, },
      },
    } = createTestModel();
    const result = await asyncChangeForPwd({ pwd: 'hello', });
    expect(result.toJS()).toEqual({
      name: 'ligx',
      pwd: 'hello',
    });
  });
});
