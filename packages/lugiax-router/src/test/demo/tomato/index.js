/**
 *
 * create by ligx
 *
 * @flow
 */
import React, { Component, } from 'react';
import { delay, } from '@lugia/react-test-utils';

import { createRoute, Link, } from '../../../lib/';

export default () => {
  return [
    <div>番茄工作法 🍅</div>,
    <Link to="/tomato/history">history</Link>,
    ' ',
    <Link to="/tomato/now">now</Link>,
    createRoute({
      '/tomato/history': {
        render: async () => {
          return delay(100, () => require('./pages/history'));
        },
      },
      '/tomato/now': {
        render: async () => {
          return delay(100, () => require('./pages/now'));
        },
      },
    }),
  ];
};
