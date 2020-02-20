/**
 *
 * create by ligx
 *
 * @flow
 */

import render from "../src/render";
import { delay } from "@lugia/react-test-utils";

async function delayFn(time) {
  await new Promise(res => {
    setTimeout(() => {
      res();
    }, time);
    jest.runAllTimers();
  });
}

describe("render.async test", () => {
  beforeEach(() => {
    render.clear();
  });
  it("simple commonFunction nesting setTimeoutFunction use beginEnd", async () => {
    let renderCount = 0;
    render.onRender("a", () => {
      ++renderCount;
    });
    function a() {
      render.beginCall("a");
      render.endCall();
    }
    const promise = new Promise(res => {
      setTimeout(() => {
        a();
        res();
      }, 1000);
    });
    await promise;
    expect(Object.keys(render.preRenderModules).length).toBe(1);
    expect(Object.keys(render.preRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(1);
  });

  it("nesting setTimeoutFunction use beginEnd and endCall && Share one onRender", () => {
    jest.useFakeTimers();
    let renderCount = 0;
    render.onRender("a", () => {
      ++renderCount;
    });
    function a() {
      render.beginCall("a");
      setTimeout(() => {
        b();
      });
      render.endCall();
    }
    function b() {
      render.beginCall("a");
      setTimeout(() => {
        c();
      });
      render.endCall();
    }
    function c() {
      render.beginCall("a");
      render.endCall();
    }
    setTimeout(() => {
      a();
    });
    expect(Object.keys(render.preRenderModules).length).toBe(0);
    expect(Object.keys(render.preRenderModules).includes("a")).toBe(false);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(0);
    jest.runAllTimers();
    expect(Object.keys(render.preRenderModules).length).toBe(1);
    expect(Object.keys(render.preRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(3);
  });

  it("nesting AysncFunction use beginEnd and endCall && Share one onRender", async () => {
    let renderCount = 0;
    render.onRender("a", () => {
      ++renderCount;
    });
    async function a() {
      render.beginCall("a");
      setTimeout(() => {
        b();
      });
      render.endCall();
    }
    async function b() {
      render.beginCall("a");
      await new Promise(res => {
        res();
      });
      c();
      render.endCall();
    }
    async function c() {
      render.beginCall("a");
      render.endCall();
    }
    await a();
    expect(Object.keys(render.preRenderModules).length).toBe(1);
    expect(Object.keys(render.preRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(1);
  });

  it("nesting setTimeoutFunction and AysncFunction  use beginEnd and endCall && Share one onRender", async () => {
    jest.useFakeTimers();
    let renderCount = 0;
    render.onRender("a", () => {
      ++renderCount;
    });
    function a() {
      console.log("timer1");
      render.beginCall("a");
      setTimeout(() => {
        b();
      });
      render.endCall();
    }
    async function b() {
      console.log("timer3");
      render.beginCall("a");
      await new Promise(res => {
        res();
      });
      c();
      render.endCall();
      console.log("timer3end");
    }
    async function c() {
      console.log("timer4");
      render.beginCall("a");
      render.endCall();
      console.log("timer4end");
    }
    a();
    console.log("timer2");
    expect(Object.keys(render.preRenderModules).length).toBe(1);
    expect(Object.keys(render.preRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(1);
    console.log("timer2.1");
    jest.runAllTimers();
    await delayFn(100);
    expect(Object.keys(render.preRenderModules).length).toBe(1);
    expect(Object.keys(render.preRenderModules).includes("a")).toBe(true);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(2);
  });

  it("nesting setTimeoutFunction use beginEnd and endCall && Share more onRender", () => {
    let renderCount = 0;
    render.onRender("a", () => {
      ++renderCount;
    });
    render.onRender("b", () => {
      ++renderCount;
    });
    render.onRender("c", () => {
      ++renderCount;
    });
    function a() {
      console.log("time-a");
      render.beginCall("a");
      setTimeout(() => {
        b();
      });
      render.endCall();
    }
    function b() {
      console.log("time-b");
      render.beginCall("b");
      setTimeout(() => {
        c();
      });
      render.endCall();
    }
    function c() {
      console.log("time-c");
      render.beginCall("c");
      render.endCall();
    }
    setTimeout(() => {
      a();
    });
    jest.runAllTimers();
    expect(Object.keys(render.preRenderModules).length).toBe(1);
    expect(Object.keys(render.preRenderModules)).toEqual(["c"]);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(3);
  });

  it("nesting AysncFunction use beginEnd and endCall && Share one onRender", async () => {
    let renderCount = 0;
    render.onRender("a", () => {
      ++renderCount;
    });
    render.onRender("b", () => {
      ++renderCount;
    });
    render.onRender("c", () => {
      ++renderCount;
    });
    async function a() {
      console.log("a");
      render.beginCall("a");
      b();
      render.endCall();
    }
    async function b() {
      console.log("b");
      render.beginCall("b");
      await new Promise(res => {
        res();
      });
      c();
      render.endCall();
    }
    async function c() {
      console.log("c");
      render.beginCall("c");
      render.endCall();
    }
    a();
    await delayFn(100);
    expect(Object.keys(render.preRenderModules).length).toBe(3);
    expect(Object.keys(render.preRenderModules)).toEqual(["a", "b", "c"]);
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(3);
  });
});
