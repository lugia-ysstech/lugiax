/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';
import {registerPersistence, default as wrapPersistence,}  from '../src';

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
    lugiax.register(wrapPersistence({
      model,
      state,
    }));
  });
});
