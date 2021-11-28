/**
 *
 * create by ligx
 *
 * @flow
 */

import { getAopHandle, } from '../src/utils';

describe('lugiax utils', () => {
  it('getAopHandle', () => {
    expect(getAopHandle('async', 'hello', {})).toEqual({});

    const aopConfig = {};
    expect(
      getAopHandle('async', 'hello', {
        async: {
          hello: aopConfig,
        },
      })
    ).toBe(aopConfig);

    expect(
      getAopHandle('async', 'abc', {
        async: {
          hello: aopConfig,
        },
      })
    ).toEqual({});
  });
});
