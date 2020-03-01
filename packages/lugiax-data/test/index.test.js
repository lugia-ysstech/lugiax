/**
 *
 * create by ligx
 *
 * @flow
 */
import { fromJS, } from 'immutable';
import {
  createChangeParam,
  createChangeParamForArrayOperator,
  createChangeParamForNumberAttributeToArray,
  createChangeParamForNumberAttributeToObject,
  createDeleteChangeParam,
  createSpecialChangeParam,
} from './data.createDataOnChange.test';
import { Delete, } from '../src/data';
import Data, { computeState, } from '../src';

const { createData, } = Data;
describe('lugiax-data.index.test.js', () => {
  it('computeState: {num | str | bool} Change ', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });
    state = computeState(state, createChangeParam('num', 555));
    expectImmutable(state).toEqual({
      num: 555,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });
    state = computeState(state, createChangeParam('str', 'world'));
    expectImmutable(state).toEqual({
      num: 555,
      str: 'world',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });
    state = computeState(state, createChangeParam('bool', false));
    expectImmutable(state).toEqual({
      num: 555,
      str: 'world',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(state, createChangeParam('obj.age', 1000));
    expectImmutable(state).toEqual({
      num: 555,
      str: 'world',
      bool: false,
      array: [1, 2, 3,],
      obj: { age: 1000, },
    });
  });

  it('computeState: array.abc ', async () => {
    //TODO:  不支持往数组面方式属性值
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(state, createChangeParam('array.abc', '煮饭', true));
    const array = [1, 2, 3,];
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array,
      obj: {},
    });
  });

  it('computeState: array[0]  array[2] ', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(
      state,
      createChangeParamForNumberAttributeToArray('array', 0, '煮饭', true)
    );
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array: ['煮饭', 2, 3,],
      obj: {},
    });

    state = computeState(
      state,
      createChangeParamForNumberAttributeToArray('array', 2, '吃饭', true)
    );
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array: ['煮饭', 2, '吃饭',],
      obj: {},
    });
  });

  it('computeState: array[3] ', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(
      state,
      createChangeParamForNumberAttributeToArray('array', 3, '煮饭', true)
    );
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3, '煮饭',],
      obj: {},
    });
  });

  it('computeState: object[3] ', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(state, createChangeParamForNumberAttributeToObject('obj', 3, '煮饭'));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {
        3: '煮饭',
      },
    });
  });

  it('computeState: root.hello = 3000', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(state, createChangeParam('hello', 3000));
    expect(state.get('hello')).toEqual(3000);
    expectImmutable(state).toEqual({
      hello: 3000,
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });
  });

  it('computeState: root.hello = {name: 1}}', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(state, createChangeParam('hello', { name: 1, }));
    expectImmutable(state.get('hello')).toEqual({ name: 1, });
    expectImmutable(state).toEqual({
      hello: { name: 1, },
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });
  });

  it('computeState: null & undefined', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(state, createChangeParam('null', { name: 1, }));
    state = computeState(state, createChangeParam('undefined', { name: 2, }));
    expectImmutable(state).toEqual({
      null: { name: 1, },
      undefined: { name: 2, },
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });
  });

  it('computeState: root[emptyStr] = 3', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(state, createChangeParam('', 3));
    expectImmutable(state).toEqual({
      '': 3,
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });
  });

  it('computeState: root.obj.obj1 = {}', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {},
    });

    state = computeState(
      state,
      createChangeParam('obj', {
        name: 1,
      })
    );

    state = computeState(
      state,
      createChangeParam('obj.obj1', {
        age: 18,
      })
    );
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {
        name: 1,
        obj1: {
          age: 18,
        },
      },
    });
  });
  it('computeState: delete obj.name', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {
        name: 1,
        title: 'hello',
      },
    });

    state = computeState(state, createDeleteChangeParam('obj.name'));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [1, 2, 3,],
      obj: {
        title: 'hello',
      },
    });
  });

  it('computeState: delete obj.array.0.name', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [{ name: 'ligx', age: 15, }, 2, 3,],
    });

    state = computeState(state, createSpecialChangeParam(['array', 0, 'name',], [], Delete, false));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [{ age: 15, }, 2, 3,],
    });
    state = computeState(state, createSpecialChangeParam(['array', 0, 'age',], [], Delete, false));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [{}, 2, 3,],
    });
  });

  it('computeState: delete obj[emptyStr]', async () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      array: [{ name: 'ligx', age: 15, }, 2, 3,],
    });

    state = computeState(state, createSpecialChangeParam(['',], [], Delete, false));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      bool: false,
      array: [{ name: 'ligx', age: 15, }, 2, 3,],
    });
  });

  it('array sort', () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      array: [1, 2, 3,],
    });

    state = computeState(
      state,
      createChangeParamForArrayOperator('array', [(a, b) => b - a,], 'sort')
    );
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      array: [3, 2, 1,],
    });
  });

  it('array reverse', () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      array: [1, 2, 3,],
    });

    state = computeState(state, createChangeParamForArrayOperator('array', [], 'reverse'));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      array: [3, 2, 1,],
    });
  });

  it('array push pop shift unshift splice', () => {
    let state = fromJS({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      data: {
        array: [1, 2, 3,],
      },
    });

    state = computeState(state, createChangeParamForArrayOperator('data.array', [5,], 'push'));
    state = computeState(state, createChangeParamForArrayOperator('data.array', [6,], 'push'));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      data: {
        array: [1, 2, 3, 5, 6,],
      },
    });
    state = computeState(state, createChangeParamForArrayOperator('data.array', [6,], 'pop'));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      data: {
        array: [1, 2, 3, 5,],
      },
    });

    state = computeState(state, createChangeParamForArrayOperator('data.array', [51,], 'unshift'));
    state = computeState(state, createChangeParamForArrayOperator('data.array', [50,], 'unshift'));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      data: {
        array: [50, 51, 1, 2, 3, 5,],
      },
    });

    state = computeState(state, createChangeParamForArrayOperator('data.array', [], 'shift'));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      data: {
        array: [51, 1, 2, 3, 5,],
      },
    });

    state = computeState(state, createChangeParamForArrayOperator('data.array', [], 'shift'));
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      data: {
        array: [1, 2, 3, 5,],
      },
    });

    state = computeState(
      state,
      createChangeParamForArrayOperator('data.array', [0, 1, 100, 101,], 'splice')
    );
    expectImmutable(state).toEqual({
      num: 100,
      str: 'hell0',
      '': 100,
      bool: false,
      data: {
        array: [100, 101, 2, 3, 5,],
      },
    });
  });

  it('createData', () => {
    const state = {
      name: 'ligx',
      array: [1, 2, 3,],
    };
    const { data, model, } = createData({
      state,
      model: 'test',
    });

    expect(model.getState().toJS()).toEqual(state);

    data.name = 'kxy';
    expect(model.getState().toJS()).toEqual(state);
    expect(model.getState().toJS().name).toEqual('kxy');
    data.$delete('name');
    expect(model.getState().toJS().name).toBeUndefined();
  });

  function expectImmutable(state) {
    return expect(state.toJS());
  }
});
