import React, { Component, } from 'react';
import { createRoute, } from '@lugia/lugiax-router';
import './App.css';
import Header from './header';
import Todo from './todo';
import Tomato from './tomato';
import NotAccess from './access/NotAccess';

export default () => {
  console.info('init main');

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
};
