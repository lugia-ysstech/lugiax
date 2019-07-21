import React, { Component, } from 'react';
import { createRoute, } from '../../src';
import Header from './header';
import Todo from './todo';
import Tomato from './tomato';
import NotAccess from './access/NotAccess';

export default class extends Component<any> {
  render() {
    return [
      <Header />,
      createRoute({
        '/todo': {
          exact: true,
          component: Todo,
        },
        '/tomato': {
          component: Tomato,
        },
        '/403': {
          component: NotAccess,
          exact: true,
        },
      }),
    ];
  }

  componentDidMount() {}
}
