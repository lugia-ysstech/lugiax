/**
 *
 * create by ligx
 *
 * @flow
 */
import type { CreateAppParam, RouterMap, } from '@lugia/lugiax-router';

import ReactDOM from 'react-dom';
import React, { Component, useContext, Suspense, lazy, } from 'react';
import lugiax from '@lugia/lugiax';
import go, { GoModel, } from './go';
import Link from './Link';
import { Redirect, Route, StaticRouter, Switch, Router, } from 'react-router'; // react-router v4
import InSetLoading from './Loading';

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
const WrapRedirect = (
  InTarget: Object,
  option: {
    redirect: { to: string, verify: () => boolean },
  }
) => {
  const { redirect, } = option;

  return (props: Object) => {
    let Target = InTarget;
    if (redirect) {
      const { to, verify, } = redirect;
      if (to && verify) {
        Target = (...props) => {
          const isVerify = verify();
          return isVerify ? <InTarget {...props} /> : <Redirect to={to} />;
        };
      }
    }
    return <Target {...props} />;
  };
};
export const LugiaxContext: any = React.createContext({});

const createPowerComponent = (opt: {
  component: ?Object,
  redirect: ?Object,
  render: ?() => Promise<any>,
  onPageLoad: ?Function,
  onPageUnLoad: ?Function,
  loading: any,
  loadingProps: Object,
}) => {
  const { onPageLoad, onPageUnLoad, render, component,  redirect, } = opt;
  const createTarget = Target => {
    const needWrap = onPageLoad || onPageUnLoad;
    Target = needWrap
      ? WrapPageLoad(Target, {
          onPageLoad,
          onPageUnLoad,
          redirect,
        })
      : Target;
    return redirect ? WrapRedirect(Target, { redirect, }) : Target;
  };
  if (render) {
    const Target = lazy(async () => {
      try {
        let Target = component;
        if (!Target) {
          Target = await render();
        }
        return { default: createTarget(Target.default), };
      } catch (error) {
        console.error(error);
      }
    });
    const {loading,loadingProps, } = opt;
    return props => {
      const loadingEl = useLoading(props, { loading, loadingProps, });
      return (
        <Suspense fallback={loadingEl}>
          <Target {...props} />
        </Suspense>
      );
    };
  }
  return createTarget(component);
};

export interface LoadingProps {
  Loading: Function;
}

type LoadingOption = { loading: Function, loadingProps: Object };

function useLoading(props: LoadingOption, option: LoadingOption = {}) {
  const appConfig = useContext(LugiaxContext);
  const { Loading: propsLoading, loadingProps: propsLoadingProps, } = props;
  const { loading: appLoading, loadingProps: appLoadingProps, } = appConfig;
  const { loading: optionLoading, loadingProps: optionLoadingProps, } = option;
  const Loading = propsLoading
    ? propsLoading
    : optionLoading
    ? optionLoading
    : appLoading
    ? appLoading
    : InSetLoading;
  const loadingProps = propsLoadingProps
    ? propsLoadingProps
    : optionLoadingProps
    ? optionLoadingProps
    : appLoadingProps
    ? appLoadingProps
    : {};
  return <Loading {...loadingProps} />;
}

const PowerRouter = (props: Object) => {
  const { PowerComponent, notVerify, verify, } = props;
  const routerConfigContext = useContext(LugiaxContext);
  const loadingEl = useLoading(props);
  const render = (routerProps: Object) => {
    const { location, } = routerProps;
    const { pathname: url, } = location;
    if (verify) {
      if (!verify({ url, })) {
        return null;
      }
    } else if (!notVerify) {
      const { onBeforeGo, verifyUrl, } = routerConfigContext;
      if (verifyUrl) {
        if (!verifyUrl({ url, })) {
          return null;
        }
      } else if (onBeforeGo) {
        const Target = lazy(async () => {
          await onBeforeGo({ url, });
          return {
            default: PowerComponent,
          };
        });

        return (
          <Suspense fallback={loadingEl}>
            <Target {...props} {...routerProps} />
          </Suspense>
        );
      }
    }
    return <PowerComponent {...props} {...routerProps} />;
  };

  return (
    <Route {...props} render={render} component={null}>
      {' '}
    </Route>
  );
};

export function createRoute(routerMap: RouterMap, option: LoadingOption = {}): ?Object {
  if (!routerMap) {
    return null;
  }
  const { loading, loadingProps, } = option;
  const routes = Object.keys(routerMap).map(path => {
    const config = routerMap[path];
    const { exact, strict, component, onPageLoad, onPageUnLoad, render, verify, redirect, } = config;
    const PowerComponent = createPowerComponent({
      redirect,
      onPageLoad,
      loading,
      loadingProps,
      onPageUnLoad,
      component,
      render,
      exact,
      strict,
    });
    const notFound = path === 'NotFound';
    if (component) {
      if (notFound) {
        return <Route component={component} notFound />;
      }
      return (
        <PowerRouter
          verify={verify}
          notVerify={notFound}
          Loading={loading}
          loadingProps={loadingProps}
          PowerComponent={PowerComponent}
          path={path}
          exact={exact}
          strict={strict}
          component={component}
        />
      );
    }
    if (render) {
      if (notFound) {
        return <PowerRouter PowerComponent={PowerComponent} notVerify />;
      }
      return (
        <PowerRouter
          verify={verify}
          notVerify={notFound}
          exact={exact}
          strict={strict}
          path={path}
          PowerComponent={PowerComponent}
          Loading={loading}
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
  const { loading = InSetLoading, onBeforeGo, verifyUrl, loadingProps = {}, } = param;

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
        <LugiaxContext.Provider value={{ onBeforeGo, verifyUrl, loading, loadingProps, }}>
          <Router history={history}>{createRoute(routerMap, { loading, loadingProps, })}</Router>
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
