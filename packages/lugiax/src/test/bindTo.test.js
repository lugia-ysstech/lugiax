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
import { bindTo, } from '../lib/';
import { createUserModel, getInputValue, } from './utils';

Enzyme.configure({ adapter: new Adapter(), });

class Input extends React.Component<any, any> {
  render() {
    return <input onChange={this.props.onChange} value={this.props.value} />;
  }
}

describe('lugiax.bindTo', () => {
  beforeEach(() => {
    lugiax.clear();
  });

  it('bindTo default', () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createUserModel(name, pwd);

    const BindInput = bindTo(userModel, 'name')(Input);

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

    const instance = target
      .children()
      .at(0)
      .instance();
    instance.componentWillUnmount.call(instance);
    changeName({ name: newName, });
    expect(getInputValue(target.find('input').at(0))).toBe(thirdName);
  });

  it('bindTo Pwd', () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createUserModel(name, pwd);

    const BindInput = bindTo(userModel, { value: 'pwd', })(Input);

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
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);
  });
});
