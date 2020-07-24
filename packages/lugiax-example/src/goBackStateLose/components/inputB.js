import React from 'react';
import { connect, } from '@lugia/lugiax';
import inputsModel from '../model';
class InputB extends React.Component<any, any> {
  static displayName = 'testInput';
  render() {
    console.log('render inputB component');
    const { value, } = this.props;
    return (
      <div style={{ border: '1px solid #000', }}>
        <p style={{ textAlign: 'center', }}>B页面值：{this.props.value}</p>
        <button
          onClick={() => {
            this.props.asyncSetRecord('4444');
          }}
        >
          修改值
        </button>
        <button onClick={this.props.asyncGoBack}>回退</button>
      </div>
    );
  }
}
const App = connect(
  inputsModel,
  state => {
    const value = state.get('value').toJS ? state.get('value').toJS() : state.get('value');
    return { value, };
  },
  mutations => {
    const { asyncGoBack, asyncSetRecord, } = mutations;
    return {
      asyncGoBack,
      asyncSetRecord,
    };
  }
)(InputB);
export default App;
