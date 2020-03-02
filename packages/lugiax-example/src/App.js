import React from 'react';
import './App.css';
import Header from './header';
import ApiTest from './apiTest';

export default class Main extends React.Component {
  constructor() {
    super();
    console.info('Main init');
  }
  render() {
    return [<Header key={'header'} />, <ApiTest />,];
  }
}
