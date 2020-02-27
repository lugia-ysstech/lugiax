/**
 *
 * create by ligx
 *
 * @flow
 */
import type { CreateAppParam, RouterMap, } from '@lugia/lugiax-router';

import ReactDOM from 'react-dom';
import React, { Component, } from 'react';
import lugiax from '@lugia/lugiax';
import go, { GoModel, } from './go';
import Link from './Link';
import { Redirect, Route, StaticRouter, Switch, Router, } from 'react-router'; // react-router v4
import Loadable from 'react-loadable';
import Loading from './Loading';

export { Route, Switch, StaticRouter, Redirect, go, Link };

const WrapPageLoad = (
  Target: Object,
  event: { onPageLoad: ?Function, onPageUnLoad: ?Function }
) => {
  return class extends React.Component<any> {
    componentDidMount() {
      const { onPageLoad, } = event;
      if (onPageLoad) {
        onPageLoad(this.props);
      }
    }

    componentWillUnmount() {
      const { onPageUnLoad, } = event;
      if (onPageUnLoad) {
        onPageUnLoad(this.props);
      }
    }

    render() {
      return <Target {...this.props} />;
    }
  };
};

export function createRoute(routerMap: RouterMap, loading: ?Object = Loading): ?Object {
  if (!routerMap) {
    return null;
  }
  const routes = Object.keys(routerMap).map(path => {
    const config = routerMap[path];
    const { component, onPageLoad, onPageUnLoad, exact, strict, } = config;
    const needWrap = onPageLoad || onPageUnLoad;

    if (component) {
      if (path === 'NotFound') {
        return <Route component={component} />;
      }
      return (
        <Route
          path={path}
          exact={exact}
          strict={strict}
          component={
            needWrap
              ? WrapPageLoad(component, {
                  onPageLoad,
                  onPageUnLoad,
                })
              : component
          }
        />
      );
    }
    const { render, } = config;
    if (render) {
      const getRender = () => {
        const Comp = Loadable({
          loader: render,
          loading,
        });
        const Target = needWrap
          ? WrapPageLoad(Comp, {
              onPageLoad,
              onPageUnLoad,
            })
          : Comp;
        return <Target />;
      };
      if (path === 'NotFound') {
        return <Route render={getRender} />;
      }
      return <Route exact={exact} strict={strict} path={path} render={getRender} />;
    }
    return 'render or component is not found!';
  });
  return <Switch>{routes}</Switch>;
}

const {
  mutations: { beforeGo, beforeReplace, asyncGo, asyncReplace,  reload, },
} = GoModel;

export function createApp(routerMap: RouterMap, history: Object, param: ?CreateAppParam = {}) {
  const { loading = Loading, onBeforeGo, } = param;
  async function checkBefore(param, cb?: (param: Object) => Promise<any>) {
    let res = true;
    if (onBeforeGo) {
      const { url, } = param;
      res = await onBeforeGo({ url, });
    }
    res && cb && (await cb(param));
  }

  const { unSubscribe: unSubscribeLugiax, } = lugiax.on(async (mutation, param) => {
    if (mutation === beforeGo) {
      await checkBefore(param, async param => {
        await asyncGo({ ...param, history, });
      });
    }
    if (mutation === beforeReplace) {
      await checkBefore(param, async param => {
        await asyncReplace({ ...param, history, });
      });
    }
  });

  lugiax.takeEveryAction(async (action: Object) => {
    if (action.type === '@@router/LOCATION_CHANGE') {
      const {
        payload: {
          location: { pathname, },
        },
      } = action;
      await checkBefore({ url: pathname, });
    }
  });

  class App extends Component<any, any> {
    componentDidMount() {
      reload({ history: [window.location.pathname,], });
    }

    componentWillUnmount() {
      unSubscribeLugiax();
      reload({ history: [], });
    }

    render() {
      return <Router history={history}>{createRoute(routerMap, loading)}</Router>;
    }
  }

  return App;
}

export function render(App: Object, domId: string) {
  const dom = document.getElementById(domId);
  if (!dom) {
    return;
  }
  ReactDOM.render(<App />, dom);
}
