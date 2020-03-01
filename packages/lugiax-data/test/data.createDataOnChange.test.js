/**
 *
 * create by ligx
 *
 * @flow
 */
import { createDataOnChange, Change, Delete, } from '../src/data';

describe('data.createDataOnChange.test.js', () => {
  let target;

  let changeParams = [];
  let arrayData = [];

  beforeEach(() => {
    changeParams = [];
    arrayData = [1, 2, 3,];
    target = createDataOnChange(
      {
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
      },
      param => {
        changeParams.push(param);
      }
    );
  });

  it('num', async () => {
    target.num = 18;

    expect(target.num).toBe(18);
    expect(changeParams).toEqual([createChangeParam('num', 18),]);
  });

  it('one.attr', async () => {
    target.one.attr = 'kxy';
    expect(changeParams).toEqual([createChangeParam('one.attr', 'kxy'),]);
  });

  it('one.two.attr', async () => {
    target.one.two.attr = 'kng';
    expect(changeParams).toEqual([createChangeParam('one.two.attr', 'kng'),]);
  });

  it('one.attr + one.two.attr', async () => {
    target.one.attr = 'kxy';
    target.one.two.attr = 'kng';
    expect(changeParams).toEqual([
      createChangeParam('one.attr', 'kxy'),
      createChangeParam('one.two.attr', 'kng'),
    ]);
  });

  it('array.push', async () => {
    target.array.push(50);
    expect(target.array).toEqual([1, 2, 3, 50,]);
    expect(changeParams).toEqual([createChangeParamForArrayOperator('array', [50,], 'push'),]);
  });

  it('array.pop', async () => {
    expect(target.array.pop()).toEqual(arrayData.pop());
    expect(target.array).toEqual(arrayData);
    expect(changeParams).toEqual([createChangeParamForArrayOperator('array', [], 'pop'),]);
  });

  it('array.shift', async () => {
    expect(target.array.shift()).toEqual(arrayData.shift());
    expect(target.array).toEqual(arrayData);
    expect(changeParams).toEqual([createChangeParamForArrayOperator('array', [], 'shift'),]);
  });

  it('array.unshift', async () => {
    expect(target.array.unshift()).toEqual(arrayData.unshift());
    expect(target.array).toEqual(arrayData);
    expect(changeParams).toEqual([createChangeParamForArrayOperator('array', [], 'unshift'),]);
  });

  it('array.splice', async () => {
    const sliceParam = [0, 1, [1, 1,],];
    expect(target.array.splice(...sliceParam)).toEqual(arrayData.splice(...sliceParam));
    expect(target.array).toEqual(arrayData);
    expect(changeParams).toEqual([
      createChangeParamForArrayOperator('array', sliceParam, 'splice'),
    ]);
  });

  it('array.sort', async () => {
    const cb = (a, b) => b - a;
    expect(target.array.sort(cb)).toEqual(arrayData.sort(cb));
    expect(target.array).toEqual(arrayData);
    expect(changeParams).toEqual([createChangeParamForArrayOperator('array', [cb,], 'sort'),]);
  });

  it('array.reverse', async () => {
    expect(target.array.reverse()).toEqual(arrayData.reverse());
    expect(target.array).toEqual(arrayData);
    expect(changeParams).toEqual([createChangeParamForArrayOperator('array', [], 'reverse'),]);
  });

  it('one.two.three.array.push', async () => {
    target.one.two.three.array.push(50);
    expect(target.one.two.three.array).toEqual([1, 2, 3, 50,]);
    expect(changeParams).toEqual([
      createChangeParamForArrayOperator('one.two.three.array', [50,], 'push'),
    ]);
  });

  it('one.two.three.array.pop', async () => {
    expect(target.one.two.three.array.pop()).toEqual(arrayData.pop());
    expect(target.one.two.three.array).toEqual(arrayData);
    expect(changeParams).toEqual([
      createChangeParamForArrayOperator('one.two.three.array', [], 'pop'),
    ]);
  });

  it('one.two.three.array.shift', async () => {
    expect(target.one.two.three.array.shift()).toEqual(arrayData.shift());
    expect(target.one.two.three.array).toEqual(arrayData);
    expect(changeParams).toEqual([
      createChangeParamForArrayOperator('one.two.three.array', [], 'shift'),
    ]);
  });

  it('one.two.three.array.unshift', async () => {
    expect(target.one.two.three.array.unshift()).toEqual(arrayData.unshift());
    expect(target.one.two.three.array).toEqual(arrayData);
    expect(changeParams).toEqual([
      createChangeParamForArrayOperator('one.two.three.array', [], 'unshift'),
    ]);
  });

  it('one.two.three.array.splice', async () => {
    const sliceParam = [0, 1, [1, 1,],];
    expect(target.one.two.three.array.splice(...sliceParam)).toEqual(
      arrayData.splice(...sliceParam)
    );
    expect(target.one.two.three.array).toEqual(arrayData);
    expect(changeParams).toEqual([
      createChangeParamForArrayOperator('one.two.three.array', sliceParam, 'splice'),
    ]);
  });

  it('one.two.three.array.sort', async () => {
    const cb = (a, b) => b - a;
    expect(target.one.two.three.array.sort(cb)).toEqual(arrayData.sort(cb));
    expect(target.one.two.three.array).toEqual(arrayData);
    expect(changeParams).toEqual([
      createChangeParamForArrayOperator('one.two.three.array', [cb,], 'sort'),
    ]);
  });

  it('one.two.three.array.reverse', async () => {
    expect(target.one.two.three.array.reverse()).toEqual(arrayData.reverse());
    expect(target.one.two.three.array).toEqual(arrayData);
    expect(changeParams).toEqual([
      createChangeParamForArrayOperator('one.two.three.array', [], 'reverse'),
    ]);
  });

  it('set string hello', () => {
    const word = 'word';
    target.$set('hello', word);
    expect(target.hello).toBe(word);
    expect(changeParams).toEqual([createChangeParam('hello', word, Change),]);

    const newWord = 'aaaaaa';
    target.hello = newWord;
    expect(changeParams).toEqual([
      createChangeParam('hello', word, Change),
      createChangeParam('hello', newWord, Change),
    ]);
  });

  it('set Object {}', () => {
    const object = { name: 1, age: 5, };

    target.$set('obj', object);

    object.name = 1000;
    target.obj.age = 5555;

    target.obj.$set('obj2', { name: 5, });
    target.obj.obj2.name = 6666;
    target.obj.obj2.$set('array', []);
    expect(target.obj).toEqual({
      name: 1000,
      age: 5555,
      obj2: {
        name: 6666,
        array: [],
      },
    });
    target.obj.obj2.array.$set(0, 100);
    target.obj.obj2.array.push(1000);
    expect(target.obj).toEqual({
      name: 1000,
      age: 5555,
      obj2: {
        name: 6666,
        array: [100, 1000,],
      },
    });
    expect(changeParams).toEqual([
      createChangeParam('obj', { name: 1, age: 5, }, Change),
      createChangeParam('obj.name', 1000, Change),
      createChangeParam('obj.age', 5555, Change),
      createChangeParam('obj.obj2', { name: 5, }, Change),
      createChangeParam('obj.obj2.name', 6666, Change),
      createChangeParam('obj.obj2.array', [], Change),
      createChangeParamForNumberAttributeToArray('obj.obj2.array', 0, 100),
      createChangeParamForArrayOperator('obj.obj2.array', [1000,], 'push'),
    ]);
  });
  it('set Object {} change to undefined', () => {
    const object = { name: 1, age: 5, };

    target.$set('obj', object);
    expect(target.obj).toBe(object);

    object.name = 1000;

    target.$set('obj', undefined);
    // target.$set()
    expect(target.obj).toBeUndefined();
    expect(changeParams).toEqual([
      createChangeParam('obj', { name: 1, age: 5, }, Change),
      createChangeParam('obj.name', 1000, Change),
      createChangeParam('obj', undefined, Change),
    ]);
  });

  it('set Object {a} change to {b}}', () => {
    const object = { name: 1, age: 5, };

    target.$set('obj', object);
    expect(target.obj).toBe(object);

    object.name = 1000;

    const objB = { ligx: true, };
    target.$set('obj', objB);
    // target.$set()
    expect(target.obj).toEqual({
      ligx: true,
    });
    expect(changeParams).toEqual([
      createChangeParam('obj', { name: 1, age: 5, }, Change),
      createChangeParam('obj.name', 1000, Change),
      createChangeParam('obj', { ligx: true, }, Change),
    ]);

    target.obj.ligx = false;
    expect(target.obj.ligx).toBeFalsy();
    expect(objB.ligx).toBeFalsy();
    expect(changeParams).toEqual([
      createChangeParam('obj', { name: 1, age: 5, }, Change),
      createChangeParam('obj.name', 1000, Change),
      createChangeParam('obj', { ligx: true, }, Change),
      createChangeParam('obj.ligx', false, Change),
    ]);
  });

  it('set Object {} change to []', () => {
    const object = { name: 1, age: 5, };

    target.$set('obj', object);
    expect(target.obj).toBe(object);

    object.name = 1000;

    const data = [1, 2, 3,];
    target.$set('obj', data);
    // target.$set()
    expect(target.obj).toEqual(data);
    expect(changeParams).toEqual([
      createChangeParam('obj', { name: 1, age: 5, }, Change),
      createChangeParam('obj.name', 1000, Change),
      createChangeParam('obj', [1, 2, 3,], Change),
    ]);

    target.obj.$set(1, 100);
    expect(data).toEqual([1, 100, 3,]);
    expect(target.obj).toEqual([1, 100, 3,]);
    expect(changeParams).toEqual([
      createChangeParam('obj', { name: 1, age: 5, }, Change),
      createChangeParam('obj.name', 1000, Change),
      createChangeParam('obj', [1, 2, 3,], Change),
      createChangeParamForNumberAttributeToArray('obj', 1, 100),
    ]);

    target.$set('obj', 5);
    expect(target.obj).toBe(5);
    expect(changeParams).toEqual([
      createChangeParam('obj', { name: 1, age: 5, }, Change),
      createChangeParam('obj.name', 1000, Change),
      createChangeParam('obj', [1, 2, 3,], Change),
      createChangeParamForNumberAttributeToArray('obj', 1, 100),
      createChangeParam('obj', 5, Change),
    ]);
  });

  it('set Object {} set num 1', () => {
    const object = { name: 1, age: 5, };

    target.$set('obj', object);
    expect(target.obj).toBe(object);

    target.obj.$set(100, 11);
    expect(target.obj).toEqual({
      name: 1,
      age: 5,
      100: 11,
    });

    expect(changeParams).toEqual([
      createChangeParam('obj', { name: 1, age: 5, }, Change),
      createChangeParamForNumberAttributeToObject('obj', '100', 11),
    ]);
  });

  it('set [] set string 1', () => {
    const object = [1, 2, 3,];

    target.$set('obj', object);
    expect(target.obj).toBe(object);

    expect(changeParams).toEqual([createChangeParam('obj', [1, 2, 3,], Change),]);
    target.obj.$set('abc', '煮饭');
    const result = [1, 2, 3,];
    result.abc = '煮饭';
    expect(target.obj).toEqual(result);

    expect(changeParams).toEqual([
      createChangeParam('obj', [1, 2, 3,], Change),
      { ...createChangeParam('obj.abc', '煮饭', Change), isArray: true, },
    ]);
  });

  it('object {1: 100}', () => {
    target.$set('obj', { 1: 100, });
    expect(changeParams).toEqual([createChangeParam('obj', { 1: 100, }, Change),]);
    target.obj[1] = 1000;
    expect(changeParams).toEqual([
      createChangeParam('obj', { 1: 100, }, Change),
      createChangeParam('obj.1', 1000, Change),
    ]);
  });
  it('set Object {} change to null', () => {
    const object = { name: 1, age: 5, };

    target.$set('obj', object);
    expect(target.obj).toBe(object);

    object.name = 1000;

    target.$set('obj', null);
    // target.$set()
    expect(target.obj).toBeNull();

    expect(changeParams).toEqual([
      createChangeParam('obj', { name: 1, age: 5, }, Change),
      createChangeParam('obj.name', 1000, Change),
      createChangeParam('obj', null, Change),
    ]);
  });

  it('set Object {} empty string', () => {
    target.$set('', 1000);
    // target.$set()
    expect(target['']).toBe(1000);

    expect(changeParams).toEqual([createChangeParam('', 1000, Change),]);
  });

  it('set Object {} undefined', () => {
    target.$set(undefined, 1000);
    // target.$set()
    expect(target.undefined).toBe(1000);

    expect(changeParams).toEqual([createChangeParam('undefined', 1000, Change),]);
  });

  it('set Object {} null', () => {
    target.$set(null, 1000);
    // target.$set()
    expect(target.null).toBe(1000);

    expect(changeParams).toEqual([createChangeParam('null', 1000, Change),]);
  });
  it('set Array [] empty string', () => {
    const data = [];
    target.$set('data', data);

    expect(target.data).toEqual([]);
    expect(changeParams).toEqual([createChangeParam('data', [], Change),]);

    target.data.$set('', 'hello');
    expect(changeParams).toEqual([
      createChangeParam('data', [], Change),
      { type: Change, value: 'hello', isArray: true, path: ['data', '',], },
    ]);
  });
  it('set Array [] null', () => {
    const data = [];
    target.$set('data', data);

    expect(target.data).toEqual([]);
    expect(changeParams).toEqual([createChangeParam('data', [], Change),]);

    target.data.$set(null, 'hello');
    expect(changeParams).toEqual([
      createChangeParam('data', [], Change),
      { type: Change, value: 'hello', isArray: true, path: ['data', 'null',], },
    ]);
  });

  it('set Array [] undefined', () => {
    const data = [];
    target.$set('data', data);

    expect(target.data).toEqual([]);
    expect(changeParams).toEqual([createChangeParam('data', [], Change),]);

    target.data.$set(undefined, 'hello');
    expect(changeParams).toEqual([
      createChangeParam('data', [], Change),
      { type: Change, value: 'hello', isArray: true, path: ['data', 'undefined',], },
    ]);
  });

  it('$delete target.num', () => {
    target.$delete('num');
    expect('num' in target).toBeFalsy();
    target.num = 111;
    expect(changeParams).toEqual([{ ...createChangeParam('', 'num', Delete), path: [], },]);
  });

  it('$delete target.one.two.attr', () => {
    target.one.two.$delete('attr');
    expect('attr' in target.one.two).toBeFalsy();
    target.one.two.attr = 341234;
    expect(changeParams).toEqual([{ ...createChangeParam('one.two', 'attr', Delete), },]);
  });

  it('$delete target.one.two.1', () => {
    target.one.two['1'] = 'abc';
    expect('1' in target.one.two).toBeTruthy();
    target.one.two.$delete(1);
    expect('1' in target.one.two).toBeFalsy();
    expect(changeParams).toEqual([{ ...createChangeParam('one.two', '1', Delete), },]);
  });

  it('$delete target.array 0 ', () => {
    target.array.$delete(0);
    expect(target.array).toEqual([2, 3,]);
    expect(changeParams).toEqual([
      { ...createChangeParamForArrayOperator('array', [0, 1,], 'splice'), },
    ]);
  });

  it('$delete target.array undefined ', () => {
    target.array.$set(undefined, '123');
    expect(target.array.undefined).toBe('123');
    target.array.$delete(undefined);
    expect(target.array).toEqual([1, 2, 3,]);
    expect(changeParams).toEqual([
      { ...createChangeParam('array.undefined', '123', Change), isArray: true, },
      { ...createChangeParam('array', 'undefined', Delete), isArray: true, },
    ]);
  });
  it('$delete target.array name', () => {
    target.array.name = 'safas';
    target.array.$delete('name');
    expect('name' in target.array).toBeFalsy();
    expect(target.array).toEqual([1, 2, 3,]);
    expect(changeParams).toEqual([
      { ...createChangeParam('array', 'name', Delete), isArray: true, },
    ]);
  });

  function createChangeParam(path, value, type = Change) {
    return {
      isArray: false,
      path: path.split('.'),
      value,
      type,
    };
  }

  function createChangeParamForArrayOperator(path, params, operator) {
    return {
      isArray: true,
      path: path.split('.'),
      params,
      type: Change,
      operator,
    };
  }

  function createChangeParamForNumberAttributeToArray(path, index, value) {
    return createChangeParamForNumberAttribute(path, index, value, true);
  }

  function createChangeParamForNumberAttributeToObject(path, index, value) {
    return createChangeParamForNumberAttribute(path, index, value, false);
  }

  function createChangeParamForNumberAttribute(path, index, value, isArray) {
    return {
      path: [...path.split('.'), index,],
      value,
      isArray,
      type: Change,
    };
  }
});
