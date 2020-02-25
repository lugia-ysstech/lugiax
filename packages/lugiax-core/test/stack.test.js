/**
 *
 * create by ligx
 *
 * @flow
 */

import Stack from "../src/stack";
describe("Stack test", () => {
  it("Stack instantiation no parameter", () => {
    let stack = new Stack();
    stack.push("22");
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it("Stack instantiation have parameter && parameter is nonstandard", () => {
    let stack = new Stack({ a: 1, b: 1 });
    stack.push("22");
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it("Stack instantiation have parameter && onStackEmpty is null && onPushItem is null", () => {
    let stack = new Stack({ onStackEmpty: null, onPushItem: null });
    stack.push("22");
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it("Stack instantiation have parameter && onStackEmpty is undefined && onPushItem is undefined", () => {
    let stack = new Stack({
      onStackEmpty: undefined,
      onPushItem: undefined
    });
    stack.push("22");
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it("Stack instantiation have parameter && parameter onStackEmpty and onPushItem is number", () => {
    let stack = new Stack({ onStackEmpty: 1, onPushItem: 1 });
    stack.push("22");
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it("Stack instantiation have parameter && parameter onStackEmpty and onPushItem is object", () => {
    let stack = new Stack({ onStackEmpty: {}, onPushItem: {} });
    stack.push("22");
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it("Stack instantiation have parameter && parameter onStackEmpty and onPushItem is boolean", () => {
    let stack = new Stack({ onStackEmpty: true, onPushItem: true });
    stack.push("22");
    stack.pop();
    expect(stack.data).toEqual([]);
  });

  it("Stack push function is work", () => {
    let stack = new Stack();
    stack.push("22");
    expect(stack.data).toEqual(["22"]);
  });

  it("Stack pop function is work", () => {
    let stack = new Stack();
    stack.push("22");
    const result = stack.pop();
    expect(stack.data).toEqual([]);
    expect(result).toEqual("22");
  });

  it("Stack instantiation  parameter have onStackEmpty function  && onPushItem by call", () => {
    let count = 0;
    const onStackEmpty = () => {
      ++count;
    };
    let stack = new Stack({ onStackEmpty });
    stack.push("22");
    stack.pop();
    expect(count).toBe(1);
  });

  it("Stack instantiation  parameter have onPushItem function && onPushItem by call", () => {
    let count = 0;
    const onPushItem = () => {
      ++count;
    };
    let stack = new Stack({ onPushItem });
    stack.push("22");
    stack.pop();
    expect(count).toBe(1);
  });

  it("Stack instantiation  parameter have onStackEmpty and onPushItem  function && onPushItem and onStackEmpty  by call", () => {
    let count = 0;
    const onStackEmpty = () => {
      ++count;
    };
    const onPushItem = () => {
      ++count;
    };
    let stack = new Stack({ onPushItem, onStackEmpty });
    stack.push("22");
    stack.pop();
    expect(count).toBe(2);
  });

  it("Stack instantiation  parameter have onStackEmpty and onPushItem  function && onPushItem and onStackEmpty  by call", () => {
    let count = 0;
    let data = "";
    const onStackEmpty = () => {
      ++count;
    };
    const onPushItem = pushData => {
      data = pushData;
      ++count;
    };
    let stack = new Stack({ onPushItem, onStackEmpty });
    stack.push("22");
    stack.pop();
    expect(data).toBe("22");
    expect(count).toBe(2);
  });
});
