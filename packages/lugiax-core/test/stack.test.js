/**
 *
 * create by ligx
 *
 * @flow
 */

import Stack from '../src/stack';
describe('Stack test', () => {
  it('Stack instantiation no parameter', () => {
    const stack = new Stack();
    stack.push('22');
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it('Stack instantiation have parameter && parameter is nonstandard', () => {
    const stack = new Stack({ a: 1, b: 1, });
    stack.push('22');
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it('Stack instantiation have parameter && onStackEmpty is null && onPushItem is null', () => {
    const stack = new Stack({ onStackEmpty: null, onPushItem: null, });
    stack.push('22');
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it('Stack instantiation have parameter && onStackEmpty is undefined && onPushItem is undefined', () => {
    const stack = new Stack({
      onStackEmpty: undefined,
      onPushItem: undefined,
    });
    stack.push('22');
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it('Stack instantiation have parameter && parameter onStackEmpty and onPushItem is number', () => {
    const stack = new Stack({ onStackEmpty: 1, onPushItem: 1, });
    stack.push('22');
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it('Stack instantiation have parameter && parameter onStackEmpty and onPushItem is object', () => {
    const stack = new Stack({ onStackEmpty: {}, onPushItem: {}, });
    stack.push('22');
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it('Stack instantiation have parameter && parameter onStackEmpty and onPushItem is boolean', () => {
    const stack = new Stack({ onStackEmpty: true, onPushItem: true, });
    stack.push('22');
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it('Stack clearStack function is work', () => {
    const stack = new Stack();
    stack.push('22');
    stack.clearStack();
    expect(stack.data).toEqual([]);
  });

  it('Stack push function is work', () => {
    const stack = new Stack();
    stack.push('22');
    expect(stack.data).toEqual(['22',]);
  });

  it('Stack pop function is work', () => {
    const stack = new Stack();
    stack.push('22');
    const result = stack.pop();
    expect(stack.data).toEqual([]);
    expect(result).toEqual('22');
  });

  it('Stack instantiation  parameter have onStackEmpty function  && onPushItem by call', () => {
    let count = 0;
    const onStackEmpty = () => {
      ++count;
    };
    const stack = new Stack({ onStackEmpty, });
    stack.push('22');
    stack.pop();
    expect(count).toBe(1);
  });

  it('Stack instantiation  parameter have onPushItem function && onPushItem by call', () => {
    let count = 0;
    let data = '';
    const onPushItem = pushData => {
      console.log('2222', pushData);
      data = pushData;
      ++count;
    };
    const stack = new Stack({ onPushItem, });
    stack.push('22');
    stack.pop();
    expect(count).toBe(1);
    expect(data).toBe('22');
  });

  it('Stack instantiation  parameter have onStackEmpty and onPushItem  function && onPushItem and onStackEmpty  by call', () => {
    let count = 0;
    let data = '';
    const onStackEmpty = () => {
      ++count;
    };
    const onPushItem = pushData => {
      data = pushData;
      ++count;
    };
    const stack = new Stack({ onPushItem, onStackEmpty, });
    stack.push('22');
    stack.pop();
    expect(count).toBe(2);
    expect(data).toBe('22');
  });

  it('Stack instantiation  parameter have onStackEmpty and onPushItem  function && onPushItem and onStackEmpty  by call', () => {
    let count = 0;
    let data = '';
    const onStackEmpty = () => {
      ++count;
    };
    const onPushItem = pushData => {
      data = pushData;
      ++count;
    };
    const stack = new Stack({ onPushItem, onStackEmpty, });
    stack.push('22');
    stack.pop();
    expect(data).toBe('22');
    expect(count).toBe(2);
  });
});
