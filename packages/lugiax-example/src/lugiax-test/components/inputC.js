import React from 'react';
import { bindTo, } from '@lugia/lugiax';
import inputsModel from '../model';
class InputC extends React.Component<any, any> {
  static displayName = 'testInput';
  render() {
    console.log('render inputC component');
    const { props, } = this;
    const { value, } = this.props;
    return (
      <div style={{ border: '1px solid #000', }}>
        <p style={{ textAlign: 'center', }}>inputC组件</p>
        <div style={{ textAlign: 'center', }}>
          inputC：
          <input {...this.props} />
        </div>
      </div>
    );
  }
}
const App = bindTo(inputsModel, 'inputC', {
  onChange: {
    inputC(e) {
      console.log('inputC');
      return e.target.value;
    },
  },
})(InputC);
export default App;
