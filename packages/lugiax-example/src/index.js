import React from 'react';
import { createBrowserHistory, } from 'history';
import { createApp, go, render, } from '@lugia/lugiax-router';
import registerServiceWorker from './registerServiceWorker';
import Main from './App';

const history = createBrowserHistory();
const App = createApp(
  {
    '/': {
      component: Main,
    },
  },
  history,
  {
    async onBeforeGo({ url, }) {
      if (url === '/nowPower') {
        await go({ url: '/403', });
        return false;
      }
      return url !== '/not';
    },
  }
);

render(() => {
  return <App />;
}, 'root');

registerServiceWorker();
