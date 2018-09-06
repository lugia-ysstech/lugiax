import React from 'react';
import { createBrowserHistory, } from 'history';
import { createApp, render, } from '@lugia/lugiax/target/lib/router';
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
  'root'
);

render(() => {
  return <App />;
}, 'root');

registerServiceWorker();
