/**
 *
 * create by ligx
 *
 * @flow
 */
import React, { Component, } from 'react';
import { createRoute, Link, } from '@lugia/lugiax-router';

export default () => {
  return [
    <div>番茄工作法 🍅</div>,
    <Link to="/tomato/history">history</Link>,
    ' ',
    <Link to="/tomato/now">now</Link>,
    createRoute({
      '/tomato/history': {
        render: async () => import('./pages/history'),
      },
      '/tomato/now': {
        render: () => import('./pages/now'),
      },
    }),
  ];
};
