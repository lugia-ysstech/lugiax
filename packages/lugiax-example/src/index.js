import React from 'react';
import { createBrowserHistory, } from 'history';
import { createApp, go, goBack, goForward, render, replace, } from '@lugia/lugiax-router';
import registerServiceWorker from './registerServiceWorker';
import Main from './App';
import BindTo from './bindTo-test';
const type = window.location.search.substr(1);
const history = createBrowserHistory();
window.globalHistory = history;
window.lugiaxHistory = {
  replace,
  go,
  goBack,
  goForward,
};
window.mountCount = 0;
render(() => {
  const App = createApp(
    {
      // '/login': {
      //   verify() {
      //     return true;
      //   },
      //   component: () => {
      //     return (
      //       <button
      //         id="login"
      //         onClick={() => {
      //           window.login = true;
      //           history.replace('/');
      //         }}
      //       >
      //         登录
      //       </button>
      //     );
      //   },
      // },
      // '/': {
      //   redirect: {
      //     to: '/login',
      //     verify: () => {
      //       return window.login;
      //     },
      //   },
      //   onPageLoad() {
      //     document.title = 'onPageLoad';
      //   },

      //   verify() {
      //     return true;
      //   },
      //   render: type === 'render' ? () => import('./App') : undefined,
      //   component: type !== 'render' ? Main : undefined,
      // },
      '/': {
        component: BindTo,
      },
    },
    history,
    {
      async onBeforeGo({ url, }) {
        if (url === '/nowPower') {
          return false;
        }
        if (url === '/news') {
          replace({ url: '/403', });
          return false;
        }
        if (url === '/games') {
          replace({ url: '/403', });
          return false;
        }
        return true;
      },
    }
  );
  return <App />;
}, 'root');

window.doNotOnBeforeGo = () => {
  render(() => {
    const App = createApp(
      {
        '/': {
          component: Main,
        },
      },
      history,
      {}
    );
    return <App />;
  }, 'root');
};

registerServiceWorker();
