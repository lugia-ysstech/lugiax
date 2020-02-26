import React from 'react';
import { bindTo, } from '@lugia/lugiax';
import inputsModel from '../model';
import Button from '../../tomato/components/Button';
class InputA extends React.Component<any, any> {
  static displayName = 'testInput';
  render() {
    console.log(this.props);
    const { inputB, } = this.props;
    console.log('render inputA component');
    return (
      <div style={{ border: '1px solid #000', }}>
        <p style={{ textAlign: 'center', }}>inputA组件</p>
        <p style={{ textAlign: 'center', }}> inputB的值：{inputB}</p>
        <div style={{ textAlign: 'center', }}>
          inputA:
          <input {...this.props} />
        </div>
        <div style={{ textAlign: 'center', }}>
          inputB:
          <input value={inputB} />
        </div>
      </div>
    );
  }
}
const App = bindTo(inputsModel, {
  inputA: 'inputA',
  inputB: 'inputB',
  inputC: 'inputC',
})(InputA);
export default App;
