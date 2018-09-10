import React, { Component, } from 'react';
import { createRoute, } from '../../lib';
import Header from './header';
import Todo from './todo';
import Tomato from './tomato';

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
      }),
    ];
  }

  componentDidMount() {}
}
