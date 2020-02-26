import React from 'react';
import { bindTo, } from '@lugia/lugiax';
import inputsModel from '../model';
class InputB extends React.Component<any, any> {
  static displayName = 'testInput';
  render() {
    console.log('render inputB component');
    const { value, } = this.props;
    return (
      <div style={{ border: '1px solid #000', }}>
        <p style={{ textAlign: 'center', }}>inputB组件</p>
        <div style={{ textAlign: 'center', }}>
          inputB：
          <input {...this.props} />
        </div>
      </div>
    );
  }
}
const App = bindTo(inputsModel, 'inputB', {
  onChange: {
    inputB(e) {
      return e.target.value;
    },
  },
})(InputB);
export default App;
