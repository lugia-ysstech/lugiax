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
  });

  it("Stack instantiation have parameter && parameter is nonstandard", () => {
    let stack = new Stack({ a: 1, b: 1 });
    stack.push("22");
    stack.pop();
  });

  it("Stack instantiation have parameter && popExecuteFn is null && pushExecuteFn is null", () => {
    let stack = new Stack({ popExecuteFn: null, pushExecuteFn: null });
    stack.push("22");
    stack.pop();
  });

  it("Stack instantiation have parameter && popExecuteFn is undefined && pushExecuteFn is undefined", () => {
    let stack = new Stack({
      popExecuteFn: undefined,
      pushExecuteFn: undefined
    });
    stack.push("22");
    stack.pop();
  });

  it("Stack instantiation have parameter && parameter popExecuteFn and pushExecuteFn is number", () => {
    let stack = new Stack({ popExecuteFn: 1, pushExecuteFn: 1 });
    stack.push("22");
    stack.pop();
  });

  it("Stack instantiation have parameter && parameter popExecuteFn and pushExecuteFn is object", () => {
    let stack = new Stack({ popExecuteFn: {}, pushExecuteFn: {} });
    stack.push("22");
    stack.pop();
  });

  it("Stack instantiation have parameter && parameter popExecuteFn and pushExecuteFn is boolean", () => {
    let stack = new Stack({ popExecuteFn: true, pushExecuteFn: true });
    stack.push("22");
    stack.pop();
  });

  it("Stack push function is work", () => {
    let stack = new Stack();
    stack.push("22");
    expect(stack.data.includes("22")).toBe(true);
  });

  it("Stack pop function is work", () => {
    let stack = new Stack();
    stack.push("22");
    const result = stack.pop();
    expect(stack.data.includes("22")).toBe(false);
    expect(result).toBe("22");
  });

  it("Stack instantiation  parameter have popExecuteFn function  && popExecuteFn by call", () => {
    let count = 0;
    const popExecuteFn = () => {
      ++count;
    };
    let stack = new Stack({ popExecuteFn });
    stack.push("22");
    stack.pop();
    expect(count).toBe(1);
  });

  it("Stack instantiation  parameter have pushExecuteFn function && pushExecuteFn by call", () => {
    let count = 0;
    const pushExecuteFn = () => {
      ++count;
    };
    let stack = new Stack({ pushExecuteFn });
    stack.push("22");
    stack.pop();
    expect(count).toBe(1);
  });

  it("Stack instantiation  parameter have popExecuteFn and pushExecuteFn  function && pushExecuteFn and popExecuteFn  by call", () => {
    let count = 0;
    const popExecuteFn = () => {
      ++count;
    };
    const pushExecuteFn = () => {
      ++count;
    };
    let stack = new Stack({ pushExecuteFn, popExecuteFn });
    stack.push("22");
    stack.pop();
    expect(count).toBe(2);
  });
});
