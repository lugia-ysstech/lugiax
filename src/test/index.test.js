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
      pwd: '123456',
    };
    const model = 'user';
    lugiax.subscribe(() => {});
    lugiax.register({
      model,
      state,
    });
    expect(lugiax.getState()).toEqual({ [model]: state, lugia, });
  });
  it('subscribeAll for force register', async () => {
    const state = {
      name: 'ligx',
      pwd: '123456',
    };
    const model = 'user';
    const trigger = new Promise(res => {
      lugiax.subscribe(lugiax.All, () => {
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
    expect(lugiax.getState()).toEqual({ [model]: state, lugia, });
  });

  it('subscribe model name is "user" for force register', async () => {
    const state = {
      name: 'ligx',
      pwd: '123456',
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
    expect(lugiax.getState()[model]).toBe(state);
    const otherState = {
      name: 'king',
      pwd: '12345',
    };
    const otherModel = model + 'other';
    lugiax.register({
      model: otherModel,
      state: otherState,
    });

    lugiax.register(
      {
        model,
        state,
      },
      { force: true, }
    );
    expect(lugiax.getState()[model]).toBe(state);
    expect(lugiax.getState()[otherModel]).toBe(otherState);

    expect(await trigger).toBe(state);
    expect(triggerCnt).toBe(1);
  });

  it('register repeact same model Error', () => {
    const state = {
      name: 'ligx',
      pwd: '123456',
    };
    const model = 'user';
    lugiax.register({
      model,
      state,
    });
    expect(lugiax.getState()).toEqual({ [model]: state, lugia, });
    expect(() =>
      lugiax.register({
        model,
        state,
      })
    ).toThrow('重复注册模块');
    expect(lugiax.getState()).toEqual({ [model]: state, lugia, });
  });
  it('register force repeact same model ', () => {
    const state = {
      name: 'ligx',
      pwd: '123456',
    };
    const model = 'user';
    lugiax.register({
      model,
      state,
    });
    expect(lugiax.getState()).toEqual({ [model]: state, lugia, });

    const newState = { name: 'kxy', pwd: '654321', };
    lugiax.register(
      {
        model,
        state: newState,
      },
      { force: true, }
    );
    expect(lugiax.getState()).toEqual({ [model]: newState, lugia, });
  });

  it('register force different  model ', () => {
    const state = {
      name: 'ligx',
      pwd: '123456',
    };
    const model = 'user';
    lugiax.register({
      model,
      state,
    });
    expect(lugiax.getState()).toEqual({ [model]: state, lugia, });

    const newState = { no: '137', ad: 'Fuzhou', };
    lugiax.register({
      model: 'address',
      state: newState,
    });
    expect(lugiax.getState()).toEqual({
      address: newState,
      [model]: state,
      lugia,
    });
  });
});
