/**
 *
 * create by ligx
 *
 * @flow
 */
import Subscribe from "../src/subscribe";

describe("subscribe.js", () => {
  it("subcribe", async () => {
    const target = new Subscribe();

    const param1 = { clientX: 1, clientY: 2 };
    const param2 = { clientX: 4, clientY: 5 };

    target.subscribe("click");
    const clickPromiseA = new Promise(res => {
      target.subscribe("click", (...params) => {
        res(params);
      });
    });

    const clickPromiseB = new Promise(res => {
      target.subscribe("click", (...params) => {
        res(params);
      });
    });

    target.trigger('click', param1, param2);
    expect(await clickPromiseA).toEqual([param1, param2]);
    expect(await clickPromiseB).toEqual([param1, param2]);
  });
});
