import React from 'react';
import { render, } from 'react-dom';

import InputA from './components/inputA';
import InputB from './components/inputB';
import InputC from './components/inputC';
import InputD from './components/inputD';
export default class Test extends React.Component {
  constructor() {
    super();
  }
  render() {
    return (
      <div>
        <div>
          <InputA />
        </div>
        <div>
          <InputB />
        </div>
        <div>
          <InputC />
        </div>
        <div>
          <InputD />
        </div>
      </div>
    );
  }
}
