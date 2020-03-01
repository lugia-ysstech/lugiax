/**
 *
 * create by ligx
 *
 * @flow
 */
import createData from '../src/data';

describe('data.test.js', () => {
  let target;

  let changeParams = [];
  let arrayData = [];

  let subscribe;
  let state;
  beforeEach(() => {
    changeParams = [];
    arrayData = [1, 2, 3,];
    target = createData({
      num: 15,
      array: [...arrayData,],
      one: {
        attr: 'hello',
        two: {
          attr: true,
          three: {
            array: [1, 2, 3,],
          },
        },
      },
    });
    ({ state, subscribe, } = target);
  });

  it('subscribe', () => {
    const params = [];
    subscribe('change', param => {
      params.push(param);
    });
    const { unSubscribe, } = subscribe('change', param => {
      params.push(param);
    });

    state.num = 1000;

    const param = {
      type: 'change',
      value: 1000,
      path: ['num',],
      isArray: false,
    };

    expect(params).toEqual([param, param,]);
    unSubscribe();
    state.num = 3000;

    expect(params).toEqual([
      param,
      param,
      {
        type: 'change',
        value: 3000,
        path: ['num',],
        isArray: false,
      },
    ]);
  });
});
