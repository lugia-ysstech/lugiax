import React, { Component, } from 'react';
import login from './models/login';
import user from './models/user';
import lugiax, { bind, connect, } from '@lugia/lugiax';
import './App.css';

class Input extends React.Component<any, any> {
  render() {
    let { value, } = this.props;
    if (value === null || value === undefined) {
      value = '';
    }
    console.info('render', value);

    return <input {...this.props} value={value} />;
  }
}

const NameInput = bind(
  login,
  model => {
    return model.get('name');
  },
  (mutations, e) => {
    return mutations.changeName({ name: e.target.value, });
  }
)(Input);

const PassWord = bind(
  login,
  model => {
    return model.get('pwd');
  },
  (mutations, e) => {
    return mutations.asyncChangePwd({ pwd: e.target.value, });
  }
)(Input);

const AgeInput = bind(
  user,
  model => {
    return model.get('age');
  },
  (mutations, e) => {
    return mutations.changeAge({ age: e.target.value, });
  }
)(Input);

const {
  mutations: { asyncChangePwd, changeName, },
} = login;

class App extends Component {
  onReset = () => {
    changeName({ name: 'ligx', });
    asyncChangePwd({ pwd: '123456', });
  };

  render() {
    return [
      <NameInput />,
      <PassWord />,
      <button onClick={this.onReset}>重置用户名密码</button>,
      <AgeInput value={this.props.age} />,
    ];
  }
}

export default App;
