/**
 *
 * create by ligx
 *
 * @flow
 */

import render from "../src/render";
const eventName = "batchModels";

describe("render.sync test", () => {
  beforeEach(() => {
    render.clear();
  });
  it("simple function use beginEnd", () => {
    let count = 0;
    let needRenderModel = {};
    render.onRender(eventName, renderModels => {
      needRenderModel = renderModels;
      ++count;
    });
    function a() {
      render.beginCall("a");
    }
    a();
    expect(needRenderModel).toEqual({});
    expect(render.willRenderModules).toEqual({ a: "a" });
    expect(Object.keys(render.willRenderModules).length).toBe(1);
    expect(count).toBe(0);
  });

  it("simple function use beginEnd and endCall", () => {
    let count = 0;
    let needRenderModel = {};
    render.onRender(eventName, renderModels => {
      needRenderModel = renderModels;
      ++count;
    });
    function a() {
      render.beginCall("a");
      render.endCall();
    }
    a();
    expect(needRenderModel).toEqual({ a: "a" });
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(count).toBe(1);
  });

  it("simple function  use frist beginEnd and then endCall", () => {
    let count = 0;
    let needRenderModel = {};
    render.onRender(eventName, renderModels => {
      needRenderModel = renderModels;
      ++count;
    });
    function a() {
      render.beginCall("a");
    }
    a();
    expect(needRenderModel).toEqual({});
    expect(render.willRenderModules).toEqual({ a: "a" });
    expect(Object.keys(render.willRenderModules).length).toBe(1);
    expect(count).toBe(0);
    render.endCall();
    expect(needRenderModel).toEqual({ a: "a" });
    expect(render.willRenderModules).toEqual({});
    expect(count).toBe(1);
  });

  it("nesting function use beginEnd and endCall ", () => {
    let count = 0;
    let needRenderModel = {};
    render.onRender(eventName, renderModels => {
      needRenderModel = renderModels;
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
    expect(needRenderModel).toEqual({ a: "a", b: "b", c: "c" });
    expect(render.willRenderModules).toEqual({});
    expect(count).toBe(1);
  });
});
