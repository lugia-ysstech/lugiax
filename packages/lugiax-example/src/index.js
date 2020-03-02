import React from 'react';
import { createBrowserHistory, } from 'history';
import { createApp, replace, render, go, goBack, goForward, Redirect,} from '@lugia/lugiax-router';
import registerServiceWorker from './registerServiceWorker';
import Main from './App';

const history = createBrowserHistory();
window.globalHistory = history;
window.lugiaxHistory = {
  replace,
  go,
  goBack,
  goForward,
};

render(() => {
  const App = createApp(
    {
      '/login': {
        verify() {
          return true;
        },
        component: () => {
          return (
            <button
              onClick={() => {
                window.login = true;
                history.replace('/');
              }}
            >
              登录
            </button>
          );
        },
      },
      '/': {
        verify() {
          return true;
        },
        component: () => {
          return window.login ? <Main /> : <Redirect to="/login" />;
        },
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
