import React, { Component, } from 'react';
import login from './models/login';
import { bind, } from '@lugia/lugiax';
import './App.css';

class Input extends React.Component<any, any> {
  render() {
    return (
      <input
        onChange={this.props.onChange}
        value={this.props.value}
        {...this.props}
      />
    );
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

class App extends Component {
  render() {
    return [<NameInput />, <PassWord />,];
  }
}

export default App;
