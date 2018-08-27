/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax-core';
import React from 'react';
import Enzyme, { mount, } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { bind, } from '../lib/';
import { createUserModel, getInputValue, } from './utils';

Enzyme.configure({ adapter: new Adapter(), });

const DisplayName = 'MyInput';

class Input extends React.Component<any, any> {
  static displayName = DisplayName;

  render() {
    return <input {...this.props} />;
  }
}

describe('lugiax.bind', () => {
  beforeEach(() => {
    lugiax.clear();
  });

  it('bind flow', () => {
    const name = 'ligx';
    const pwd = '123456';
    const newPwd = '我服';
    const userModel = createUserModel(name, pwd);

    const BindInput = bind(
      userModel,
      model => {
        const result = { value: model.get('name'), pwd: model.get('pwd'), };
        return result;
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value, });
        },
        onClick: (mutations, e) => {
          return mutations.changePwd({ pwd: newPwd, });
        },
      }
    )(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInput />;
      }
    }

    const target = mount(<App />);
    const { model, } = userModel;
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe(name);
    expect(getInputValue(target.find('input').at(0))).toBe(name);

    const newName = 'my name is ';
    target.simulate('change', { target: { value: newName, }, });
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe(newName);
    expect(getInputValue(target.find('input').at(0))).toBe(newName);

    const {
      mutations: { changeName, },
    } = userModel;
    const thirdName = 'thirdName';
    changeName({ name: thirdName, });
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe(thirdName);
    expect(getInputValue(target.find('input').at(0))).toBe(thirdName);

    target.simulate('click');
    expect(
      lugiax
        .getState()
        .get(model)
        .get('pwd')
    ).toBe(newPwd);
    expect(target.find(DisplayName).props().pwd).toBe(newPwd);

    const instance = target
      .children()
      .at(0)
      .instance();
    instance.componentWillUnmount.call(instance);
    changeName({ name: newName, });
    expect(getInputValue(target.find('input').at(0))).toBe(thirdName);
  });
  it('bind not exist eventhandler', () => {
    const name = 'ligx';
    const pwd = '123456';
    const newPwd = '我服';
    const userModel = createUserModel(name, pwd);

    const BindInput = bind(
      userModel,
      model => {
        const result = { value: model.get('name'), pwd: model.get('pwd'), };
        return result;
      },
      {}
    )(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInput />;
      }
    }

    const target = mount(<App />);

    expect(getInputValue(target.find('input').at(0))).toBe(name);
    expect(target.find(DisplayName).props().pwd).toBe(pwd);
  });
  it('bind not exist eventhandler', () => {
    const name = 'ligx';
    const pwd = '123456';
    const newPwd = '我服';
    const userModel = createUserModel(name, pwd);

    const BindInput = bind(
      userModel,
      model => {
        return {};
      },
      {}
    )(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInput />;
      }
    }

    const target = mount(<App />);

    expect(getInputValue(target.find('input').at(0))).toBe('');
    expect(target.find(DisplayName).props().pwd).toBeUndefined();
  });
});
