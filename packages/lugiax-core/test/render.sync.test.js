/**
 *
 * create by ligx
 *
 * @flow
 */

import render from "../src/render";

describe("render.sync test", () => {
  beforeEach(() => {
    render.clear();
  });
  it("simple function use beginEnd", () => {
    let count = 0;
    render.onRender("a", () => {
      ++count;
    });
    function a() {
      render.beginCall("a");
    }
    a();
    expect(Object.keys(render.preRenderModules).length).toBe(0);
    expect(Object.keys(render.willRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(1);
    expect(count).toBe(0);
  });

  it("simple function use beginEnd and endCall", () => {
    let count = 0;
    render.onRender("a", () => {
      ++count;
    });
    function a() {
      render.beginCall("a");
      render.endCall();
    }
    a();
    expect(Object.keys(render.preRenderModules).length).toBe(1);
    expect(Object.keys(render.preRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(count).toBe(1);
  });

  it("simple function  use frist beginEnd and then endCall", () => {
    let count = 0;
    render.onRender("a", () => {
      ++count;
    });
    function a() {
      render.beginCall("a");
    }
    a();
    expect(Object.keys(render.preRenderModules).length).toBe(0);
    expect(Object.keys(render.willRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(1);
    expect(count).toBe(0);
    render.endCall();
    expect(Object.keys(render.preRenderModules).length).toBe(1);
    expect(Object.keys(render.preRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(count).toBe(1);
  });

  it("nesting function use beginEnd and endCall && Share one onRender", () => {
    let count = 0;
    render.onRender("a", () => {
      ++count;
    });
    function a() {
      render.beginCall("a");
      b();
      render.endCall();
    }
    function b() {
      render.beginCall("a");
      c();
      render.endCall();
    }
    function c() {
      render.beginCall("a");
      render.endCall();
    }
    a();
    expect(Object.keys(render.preRenderModules).length).toBe(1);
    expect(Object.keys(render.preRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(count).toBe(1);
  });

  it("nesting function use beginEnd and endCall && Share more onRender", () => {
    let count = 0;
    render.onRender("a", () => {
      ++count;
    });
    render.onRender("b", () => {
      ++count;
    });
    render.onRender("c", () => {
      ++count;
    });
    function a() {
      render.beginCall("a");
      b();
      render.endCall();
    }
    function b() {
      render.beginCall("b");
      c();
      render.endCall();
    }
    function c() {
      render.beginCall("c");
      render.endCall();
    }
    a();
    expect(Object.keys(render.preRenderModules).length).toBe(3);
    expect(Object.keys(render.preRenderModules)).toEqual(["a", "b", "c"]);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(count).toBe(3);
  });
});
