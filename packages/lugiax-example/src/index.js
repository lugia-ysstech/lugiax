import React from 'react';
import { createBrowserHistory, } from 'history';
import { render, } from '@lugia/lugiax/target/lib/router';
import registerServiceWorker from './registerServiceWorker';
import Todo from './todo';
const history = createBrowserHistory();
render(
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
registerServiceWorker();
