/**
 *
 * create by ligx
 *
 * @flow
 */
import type { CreateAppParam, RouterMap, } from '@lugia/lugiax-router';

import ReactDOM from 'react-dom';
import React, { Component, useContext, } from 'react';
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
export const LugiaxContext: any = React.createContext({});

const PowerRouter = (props: Object) => {
  const { loading, } = props;
  const lugiaxConfig = useContext(LugiaxContext);

  const render = (routerProps: Object) => {
    const { location, } = routerProps;
    const { onBeforeGo, } = lugiaxConfig;

    const LoaderResult = Loadable({
      loader: async () => {
        try {
          const { pathname: url, } = location;
          const { notFound, } = props;
          if (!notFound && onBeforeGo) {
            await onBeforeGo({ url, });
          }
          let { component: Target, } = props;
          if (!Target) {
            const { render, } = props;
            Target = await render();
          }
          const { needWrap, onPageLoad, onPageUnLoad, } = props;

          return needWrap
            ? WrapPageLoad(Target, {
                onPageLoad,
                onPageUnLoad,
              })
            : Target;
        } catch (error) {
          console.error(error);
        }
      },
      loading,
    });

    return <LoaderResult {...routerProps} />;
  };

  return (
    <Route {...props} render={render} component={null}>
      {' '}
    </Route>
  );
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
        return <Route component={component} notFound />;
      }
      return (
        <PowerRouter
          path={path}
          exact={exact}
          strict={strict}
          loading={loading}
          needWrap={needWrap}
          component={component}
          onPageLoad={onPageLoad}
          onPageUnLoad={onPageUnLoad}
        />
      );
    }
    const { render, } = config;
    if (render) {
      if (path === 'NotFound') {
        return (
          <PowerRouter
            render={render}
            onPageLoad={onPageLoad}
            loading={loading}
            onPageUnLoad={onPageUnLoad}
            notFound
          />
        );
      }
      return (
        <PowerRouter
          exact={exact}
          strict={strict}
          path={path}
          loading={loading}
          render={render}
          needWrap={needWrap}
          onPageLoad={onPageLoad}
          onPageUnLoad={onPageUnLoad}
        />
      );
    }
    return 'render or component is not found!';
  });
  return <Switch>{routes}</Switch>;
}

const {
  mutations: { beforeGo, beforeReplace, go: goUrl, replace, },
} = GoModel;

export function createApp(routerMap: RouterMap, history: Object, param: ?CreateAppParam = {}) {
  const { loading = Loading, onBeforeGo, } = param;

  function createHandle(cb) {
    return param => {
      cb({ ...param, history, });
    };
  }

  const doBeforeGo = createHandle(goUrl);
  const doBeforeReplace = createHandle(replace);
  const { unSubscribe: unSubscribeLugiax, } = lugiax.on((mutation, param) => {
    if (mutation === beforeGo) {
      doBeforeGo(param);
    }
    if (mutation === beforeReplace) {
      doBeforeReplace(param);
    }
  });

  class App extends Component<any, any> {
    componentWillUnmount() {
      unSubscribeLugiax();
    }

    render() {
      return (
        <LugiaxContext.Provider value={{ onBeforeGo, }}>
          <Router history={history}>{createRoute(routerMap, loading)}</Router>
        </LugiaxContext.Provider>
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
