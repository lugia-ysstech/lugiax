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
    lugiax.register({
      model,
      state,
    });
    expect(lugiax.getState()).toEqual({ [model]: state, lugia, });
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
    // expect(() => lugiax.register({
    //   model,
    //   state,
    // })).toThrow('重复注册模块');

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
