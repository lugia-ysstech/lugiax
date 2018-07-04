/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '../lib';

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

  it('dispatch for changeModel', async () => {
    const state = {
      name: 'ligx',
      pwd: '9',
    };
    const model = 'user';
    let obj = {};
    const actionName = '@lugiax/user.changeUseName';

    const newName = '100';
    const otherModel = 'otherModel';
    const otherState = {
      hello: '无形',
    };
    lugiax.register({
      model: otherModel,
      state: otherState,
    });

    const actionPromise = new Promise(res => {
      const action = {
        async changeUseName(modelData: Object) {
          expect(lugiax.getState().get(model)).toBe(modelData);
          expect(modelData.toJS()).toEqual(state);
          res(true);
          return modelData.set('name', newName);
        },
      };
      obj = lugiax.register({
        model,
        state,
        action,
      });

      expect(lugiax.action2Process).toEqual({
        [actionName]: { body: action.changeUseName, modelName: model, },
      });
    });

    const { changeUseName, } = obj;
    const oldModelData = lugiax.getState().get(model);

    await changeUseName();
    await actionPromise;

    expect(lugiax.getState().get(model)).not.toBe(oldModelData);
    expect(lugiax.getState().get(otherModel)).not.toBe(otherState);
    expect(lugiax.getState().toJS()).toEqual({
      [model]: { pwd: state.pwd, name: newName, },
      lugia,
      [otherModel]: otherState,
    });
  });

  it('dispatch  param and return undefined dispatch same model', async () => {
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
        action: {
          async login(modelData: Object, inParam: Object, { action, }) {
            const { changeUserInfo, } = action;
            expect(inParam).toBe(param);
            // login verify
            await changeUserInfo(inParam);
          },

          async changeUserInfo(modelData: Object, inParam: Object) {
            res(true);
            return modelData.merge(inParam);
          },
        },
      });
    });

    const { login, } = obj;
    await login(param);
    await actionPromise;
    expect(
      lugiax
        .getState()
        .get(model)
        .toJS()
    ).toEqual(param);
  });

  it('dispatch  param and return undefined dispatch same model', async () => {
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
        action: {
          async changeUserInfo(modelData: Object, inParam: Object) {
            res(true);
            return modelData.merge(inParam);
          },
        },
      });

      loginModel = lugiax.register({
        model: 'login',
        state: {},
        action: {
          async login(modelData: Object, inParam: Object) {
            expect(inParam).toBe(userInfoParam);
            // login verify
            const { changeUserInfo, } = userModel;
            await changeUserInfo(inParam);
          },
        },
      });
    });

    const { login, } = loginModel;
    await login(userInfoParam);
    await actionPromise;
    expect(
      lugiax
        .getState()
        .get(userModelName)
        .toJS()
    ).toEqual(userInfoParam);
  });
});
