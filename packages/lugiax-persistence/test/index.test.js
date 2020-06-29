/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';
import {
  registerPersistence,
  unRegisterPersistence,
  getPersistence,
  default as wrapPersistence,
  clearPersistence,
} from '../src';
const EventEmitter = require('events').EventEmitter;

describe('lugiax-persistence', () => {
  beforeEach(() => {
    lugiax.clear();
    clearPersistence();
  });

  it('registerPersistence is undefined', () => {
    const getFn = undefined;
    registerPersistence(getFn, 'myPersistence');
    const persistence = getPersistence('myPersistence');
    expect(getFn).toEqual(persistence);
  });

  it('registerPersistence is function', () => {
    const getFn = () => {};
    registerPersistence(getFn, 'myPersistence');
    const persistence = getPersistence('myPersistence');
    expect(persistence).toEqual(undefined);
  });
  it('registerPersistence is {}', () => {
    const getFn = {};
    registerPersistence(getFn, 'myPersistence');
    const persistence = getPersistence('myPersistence');
    expect(persistence).toEqual(undefined);
  });

  it('registerPersistence is 1', () => {
    const getFn = 1;
    registerPersistence(getFn, 'myPersistence');
    const persistence = getPersistence('myPersistence');
    expect(persistence).toEqual(undefined);
  });

  it('registerPersistence is error object', () => {
    const getFn = { a: 1, b: 1, };
    registerPersistence(getFn, 'myPersistence');
    const persistence = getPersistence('myPersistence');
    expect(persistence).toEqual(undefined);
  });

  it('registerPersistence is right object', () => {
    const getFn = { getStore: () => {}, saveStore: () => {}, };
    registerPersistence(getFn, 'myPersistence');
    const persistence = getPersistence('myPersistence');
    expect(getFn).toEqual(persistence);
  });

  it('registerPersistence and unRegisterPersistence', () => {
    const getFn = { getStore: () => {}, saveStore: () => {}, };
    const getFnOther = {
      getStore: () => {
        console.log('other');
      },
      saveStore: () => {
        console.log('other');
      },
    };
    registerPersistence(getFn, 'myPersistence');
    registerPersistence(getFnOther, 'other');
    let persistence;
    let other;
    persistence = getPersistence('myPersistence');
    other = getPersistence('other');
    expect(getFn).toEqual(persistence);
    expect(getFnOther).toEqual(other);
    unRegisterPersistence('other');
    other = getPersistence('other');
    expect(other).toEqual(undefined);
    clearPersistence();
    persistence = getPersistence('myPersistence');
    other = getPersistence('other');
    expect(persistence).toEqual(undefined);
    expect(other).toEqual(undefined);
  });

  it('wrapPersistence normal', () => {
    const state = {
      name: 'ligx',
      pwd: '1',
    };
    const model = 'user';
    lugiax.register(
      wrapPersistence({
        model,
        state,
      })
    );
    lugiax._microfe_ = true;
    expect(lugiax.getState().toJS()).toEqual({
      [model]: state,
      lugia: {
        loading: { user: false, },
      },
    });
  });

  it('wrapPersistence mutil level state', () => {
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
    lugiax.register(
      wrapPersistence({
        model,
        state,
      })
    );
    expect(
      lugiax
        .getState()
        .get(model)
        .get('data')
        .toJS()
    ).toEqual(state.data);
  });

  it('wrapPersistence state is undefined', async () => {
    lugiax.register(
      wrapPersistence({
        model: 'lgx',
      })
    );
  });

  it('wrapPersistence use sync mutations', () => {
    const state = {
      name: 'ligx',
      pwd: '9',
    };
    const model = 'user';
    const obj = lugiax.register(
      wrapPersistence({
        model,
        state,
        mutations: {
          sync: {
            changeName: (state, inpar, { mutations, getState, }) => {
              state = getState();
              return state.set('name', inpar);
            },
          },
        },
      })
    );
    const newName = 'www';
    const { mutations, } = obj;
    mutations.changeName(newName);
    expect(obj.getState().toJS().name).toEqual(newName);
  });

  it('wrapPersistence use async mutations', async () => {
    const promiseEvent = new EventEmitter();
    const state = {
      name: 'ligx',
      pwd: '9',
    };
    const model = 'user';
    const obj = lugiax.register(
      wrapPersistence({
        model,
        state,
        mutations: {
          async: {
            changeName: async (state, inpar, { mutations, getState, }) => {
              const list = await new Promise(res => {
                setTimeout(() => {
                  res(inpar);
                }, 200);
              }).then(data => {
                promiseEvent.emit('update');
                return data;
              });
              state = getState();
              return state.set('name', list);
            },
          },
        },
      })
    );
    const newName = 'www';
    const { mutations, } = obj;
    mutations.asyncChangeName(newName).then(() => {
      promiseEvent.emit('update');
    });
    const promise = new Promise(res => {
      let count = 0;
      const countFn = () => {
        if (count === 1) {
          res('ok');
        }
        count++;
      };
      promiseEvent.on('update', () => {
        countFn();
      });
    });
    await promise;
    expect(obj.getState().toJS().name).toEqual(newName);
  });
});
