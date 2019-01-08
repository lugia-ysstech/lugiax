/**
 *
 * create by ligx
 *
 * @flow
 */
import type { CreateAppParam, RouterMap, } from '@lugia/lugiax-router';

import ReactDOM from 'react-dom';
import React, { Component, } from 'react';
import lugiax from '@lugia/lugiax-core';
import { Provider, } from 'react-redux';
import go, { GoModel, } from './go';
import Link from './Link';
import {
  ConnectedRouter,
  connectRouter,
  routerMiddleware,
} from 'connected-react-router/immutable';
import { Redirect, Route, StaticRouter, Switch, } from 'react-router'; // react-router v4
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

export function createRoute(
  routerMap: RouterMap,
  loading?: Object = Loading
): ?Object {
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
      return (
        <Route
          exact={exact}
          strict={strict}
          path={path}
          render={() => {
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
          }}
        />
      );
    }
    return 'render or component is not found!';
  });
  return <Switch>{routes}</Switch>;
}

const {
  mutations: { asyncBeforeGo, asyncGo, },
} = GoModel;

export function createApp(
  routerMap: RouterMap,
  history: Object,
  param?: CreateAppParam = {}
) {
  const { loading = Loading, onBeforeGo, } = param;

  lugiax.resetStore(routerMiddleware(history), connectRouter(history));

  async function checkBefore(param, cb?: (param: Object) => Promise<any>) {
    let res = true;
    if (onBeforeGo) {
      const { url, } = param;
      res = await onBeforeGo({ url, });
    }
    res && cb && (await cb(param));
  }

  lugiax.on(async (mutation, param) => {
    if (mutation === asyncBeforeGo) {
      await checkBefore(param, async param => {
        await asyncGo(param);
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
    render() {
      return (
        <Provider store={lugiax.getStore()}>
          <ConnectedRouter history={history}>
            {createRoute(routerMap, loading)}
          </ConnectedRouter>
        </Provider>
      );
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
