/**
 *
 * create by ligx
 *
 * @flow
 */
import React, { Component, } from 'react';
import { createRoute, Link, } from '@lugia/lugiax/target/lib/router';

export default () => {
  console.info('init tomato');

  return [
    <div>番茄工作法 🍅</div>,
    <Link to="/tomato/history">history</Link>,
    ' ',
    <Link to="/tomato/now">now</Link>,
    createRoute({
      '/tomato/history': {
        render: async () => import('./history'),
      },
      '/tomato/now': {
        render: () => import('./now'),
      },
    }),
  ];
};
