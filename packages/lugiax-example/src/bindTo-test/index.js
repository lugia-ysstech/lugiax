import React from 'react';
import App from './app';
import { render, } from 'react-dom';
export default class Test extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div>
        <App />
      </div>
    );
  }
}
