import React from 'react';
import { createBrowserHistory, } from 'history';
import { createApp, replace, render, go, goBack, goForward,} from '@lugia/lugiax-router';
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
        return false;
      }
      if (url === '/news') {
        replace({ url: '/403', });
      }
      if (url === '/games') {
        replace({ url: '/403', });
      }
    },
  }
);

render(() => {
  return <App />;
}, 'root');

registerServiceWorker();
