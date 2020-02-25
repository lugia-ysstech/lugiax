/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from "@lugia/lugiax";
import { push } from "connected-react-router";

function getUrlAndNextCurrent(arr: Array, newCurrent: number) {
  const len = arr.length - 1;
  const nextCurrent = newCurrent > len ? len : newCurrent < 0 ? 0 : newCurrent;

  return {
    url: arr[nextCurrent],
    nextCurrent
  };
}

const model = lugiax.register({
  model: "@lugiax/router",
  state: {
    current: 0,
    history: []
  },
  mutations: {
    async: {
      async beforeGo(state: Object) {
        return state;
      },
      async go(state: Object, inParam: Object) {
        const store = lugiax.getStore();
        const { url } = inParam;
        const current = state.get("current");
        if (url) {
          store.dispatch(push(url));

          let history = state.get("history");
          history =
            history.size === 0
              ? history.push(url)
              : history.slice(0, current + 1).push(url);

          state = state.set("current", history.size - 1);
          return state.set("history", history);
        }

        const { count } = inParam;
        const goIndex = Math.floor(count);
        if (isNaN(goIndex)) {
          return state;
        }

        const { nextCurrent, url: nextUrl } = getUrlAndNextCurrent(
          state.get("history").toJS(),
          current + goIndex
        );
        store.dispatch(push(nextUrl));
        return state.set("current", nextCurrent);
      },

      async replace(state: Object, inParam: Object) {
        const store = lugiax.getStore();
        const { url } = inParam;
        const current = state.get("current");

        store.dispatch(push(url));

        let history = state.get("history");
        history =
          history.size === 0
            ? history.push(url)
            : history.slice(0, current).push(url);

        state = state.set("current", history.size - 1);
        return state.set("history", history);
      },

      async goBack(state: Object, inParam: Object, mutations: Object) {
        mutations.mutations.asyncGo({ count: -1 });
      },

      async goForward(state: Object, inParam: Object, mutations: Object) {
        mutations.mutations.asyncGo({ count: 1 });
      }
    }
  }
});

export const GoModel = model;
export const goBack = model.mutations.asyncGoBack;
export const goForward = model.mutations.asyncGoForward;
export const replace = model.mutations.asyncReplace;
export default model.mutations.asyncBeforeGo;
