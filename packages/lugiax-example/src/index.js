import React from 'react';
import { createBrowserHistory, } from 'history';
import { createApp, render, } from '@lugia/lugiax/target/lib/router';
import registerServiceWorker from './registerServiceWorker';
import Todo from './todo';

const history = createBrowserHistory();

const App = createApp(
  {
    '/todo': {
      render: () => import('./todo'),
    },
    '/a': {
      component: Todo,
    },
  },
  history,
  'root'
);

render(() => {
  return <App />;
}, 'root');

registerServiceWorker();
