import React from 'react';
import { connect, } from '@lugia/lugiax';
import inputsModel from '../model';
import { go, goBack, } from '@lugia/lugiax-router';
import Button from '../../tomato/components/Button';
class InputA extends React.Component<any, any> {
  static displayName = 'testInput';
  render() {
    console.log(this.props);
    console.log('render inputA component');
    return (
      <div style={{ border: '1px solid #000', }}>
        <p style={{ textAlign: 'center', }}>A页面值：{this.props.value}</p>
        <button
          onClick={() => {
            go({ url: '/b', });
          }}
        >
          跳转
        </button>
        <button
          onClick={() => {
            this.props.asyncSetRecord('2222');
          }}
        >
          修改值
        </button>
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
    console.log(mutations);
    const { asyncSetRecord, } = mutations;
    return {
      asyncSetRecord,
    };
  }
)(InputA);
export default App;
