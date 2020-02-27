import React, { Component, } from 'react';
import { createRoute, } from '@lugia/lugiax-router';
import './App.css';
import Form from './form';
import Header from './header';
import Todo from './todo';
import Count from './count';
import Tomato from './tomato';
import LugiaxTest from './lugiax-test/';
import NotAccess from './access/NotAccess';
import ApiTest from './apiTest';

console.log('LugiaxTest', LugiaxTest);

export default () => {
  console.info('init main');
  console.info('Count', Count);

  return [
    <Header />,
    <ApiTest/>,
  ];
};
