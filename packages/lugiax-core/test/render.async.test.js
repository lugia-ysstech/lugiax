/**
 *
 * create by ligx
 *
 * @flow
 */

import render from '../src/render';

async function delayFn(time) {
  await new Promise(res => {
    setTimeout(() => {
      res();
    }, time);
    jest.runAllTimers();
  });
}

describe('render.async test', () => {
  beforeEach(() => {
    render.clear();
  });
  const eventName = 'batchModels';
  it('simple commonFunction nesting setTimeoutFunction use beginEnd', async () => {
    let renderCount = 0;
    let needRenderModel = {};
    render.onRender(eventName, needModels => {
      needRenderModel = needModels;
      ++renderCount;
    });
    function a() {
      render.beginCall('a');
      render.endCall();
    }
    const promise = new Promise(res => {
      setTimeout(() => {
        a();
        res();
      }, 1000);
    });
    await promise;
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(needRenderModel).toEqual({ a: true, });
    expect(renderCount).toBe(1);
  });

  it('nesting setTimeoutFunction use beginEnd and endCall && Share one ', () => {
    jest.useFakeTimers();
    let renderCount = 0;
    let needRenderModel = {};
    const renderHistory = [];
    render.onRender(eventName, needModels => {
      needRenderModel = needModels;
      renderHistory.push(needModels);
      ++renderCount;
    });
    function a() {
      render.beginCall('a');
      setTimeout(() => {
        b();
      });
      render.endCall();
    }
    function b() {
      render.beginCall('b');
      setTimeout(() => {
        c();
      });
      render.endCall();
    }
    function c() {
      render.beginCall('c');
      render.endCall();
    }
    setTimeout(() => {
      a();
    });
    expect(needRenderModel).toEqual({});
    expect(render.willRenderModules).toEqual({});
    expect(renderCount).toBe(0);
    jest.runAllTimers();
    expect(needRenderModel).toEqual({ c: true, });
    expect(render.willRenderModules).toEqual({});
    expect(renderCount).toBe(3);
    expect(renderHistory).toEqual([{ a: true, }, { b: true, }, { c: true, },]);
  });

  it('nesting AysncFunction use beginEnd and endCall && Share one onRender', async () => {
    let renderCount = 0;
    let needRenderModel = {};
    render.onRender(eventName, needModels => {
      needRenderModel = needModels;
      ++renderCount;
    });
    async function a() {
      render.beginCall('a');
      setTimeout(() => {
        b();
      });
      render.endCall();
    }
    async function b() {
      render.beginCall('b');
      await new Promise(res => {
        res();
      });
      c();
      render.endCall();
    }
    async function c() {
      render.beginCall('c');
      render.endCall();
    }
    await a();
    expect(needRenderModel).toEqual({ a: true, });
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(1);
    await delayFn(100);
    expect(needRenderModel).toEqual({ b: true, c: true, });
  });

  it('nesting setTimeoutFunction and AysncFunction  use beginEnd and endCall && Share one onRender', async () => {
    jest.useFakeTimers();
    let renderCount = 0;
    let needRenderModel = {};
    const renderHistory = [];
    render.onRender(eventName, needModels => {
      needRenderModel = needModels;
      renderHistory.push(needModels);
      ++renderCount;
    });
    function a() {
      render.beginCall('a');
      setTimeout(() => {
        b();
      });
      render.endCall();
    }
    async function b() {
      render.beginCall('b');
      await new Promise(res => {
        res();
      });
      c();
      render.endCall();
    }
    async function c() {
      render.beginCall('c');
      render.endCall();
    }
    a();
    expect(needRenderModel).toEqual({ a: true, });
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(1);
    jest.runAllTimers();
    await delayFn(100);
    expect(needRenderModel).toEqual({ b: true, c: true, });
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(2);
    expect(renderHistory).toEqual([{ a: true, }, { b: true, c: true, },]);
  });

  it('nesting setTimeoutFunction use beginEnd and endCall && Share more onRender', () => {
    let renderCount = 0;
    let needRenderModel = {};
    const renderHistory = [];
    render.onRender(eventName, needModels => {
      renderHistory.push(needModels);
      needRenderModel = needModels;
      ++renderCount;
    });
    function a() {
      render.beginCall('a');
      setTimeout(() => {
        b();
      });
      render.endCall();
    }
    function b() {
      render.beginCall('b');
      setTimeout(() => {
        c();
      });
      render.endCall();
    }
    function c() {
      render.beginCall('c');
      render.endCall();
    }
    setTimeout(() => {
      a();
    });
    jest.runAllTimers();
    expect(needRenderModel).toEqual({ c: true, });
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(3);
    expect(renderHistory).toEqual([{ a: true, }, { b: true, }, { c: true, },]);
  });

  it('nesting AysncFunction use beginEnd and endCall && Share one onRender', async () => {
    let renderCount = 0;
    let needRenderModel = {};
    const renderHistory = [];
    render.onRender(eventName, needModels => {
      renderHistory.push(needModels);
      needRenderModel = needModels;
      ++renderCount;
    });

    async function a() {
      render.beginCall('a');
      b();
      render.endCall();
    }
    async function b() {
      render.beginCall('b');
      await new Promise(res => {
        res();
      });
      c();
      render.endCall();
    }
    async function c() {
      render.beginCall('c');
      render.endCall();
    }
    a();
    await delayFn(100);
    expect(needRenderModel).toEqual({ a: true, b: true, c: true, });
    expect(Object.keys(render.willRenderModules).length).toBe(0);
    expect(renderCount).toBe(1);
    expect(renderHistory).toEqual([{ a: true, b: true, c: true, },]);
  });

  it(' syncfunction call asyncFunction  call syncfunction', async () => {
    let renderCount = 0;
    let needRenderModel = {};
    const renderHistory = [];
    render.onRender(eventName, needModels => {
      renderHistory.push(needModels);
      needRenderModel = needModels;
      ++renderCount;
    });

    function a() {
      render.beginCall('a');
      setTimeout(() => {
        b();
      });
      render.endCall();
    }
    async function b() {
      render.beginCall('b');
      await c();
      render.endCall();
    }
    async function c() {
      render.beginCall('c');
      render.endCall();
    }
    a();
    expect(needRenderModel).toEqual({ a: true, });
    expect(render.willRenderModules).toEqual({});
    expect(renderCount).toBe(1);
    await delayFn(100);
    expect(renderHistory).toEqual([{ a: true, }, { b: true, c: true, },]);
  });
});
