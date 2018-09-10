import React, { Component, } from 'react';
import { createRoute, } from '@lugia/lugiax-router';
import './App.css';
import Header from './header';
import Todo from './todo';
import Tomato from './tomato';

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
    }),
  ];
};
