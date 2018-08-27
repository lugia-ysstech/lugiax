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
    const { value = '', } = this.props;
    return <input {...this.props} value={value === null ? '' : value} />;
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

  it('bindTo Pwd to Value Props', () => {
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

  it('bindTo pwd: value & name: theName ', () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createUserModel(name, pwd);

    const BindInput = bindTo(
      userModel,
      { pwd: 'value', name: 'theName', },
      {
        onChange: {
          name: e => {
            return e.target.value + 'is name';
          },
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
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);

    const newValue = 'hello';

    target.simulate('change', { target: { value: newValue, }, });

    expect(getInputValue(target.find('input').at(0))).toBe(newValue);
    expect(
      lugiax
        .getState()
        .get(model)
        .get('pwd')
    ).toBe(newValue);
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe(newValue + 'is name');
  });
  it('bindTo pwd: value  name: theName different eventHandle', () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createUserModel(name, pwd);

    const BindInput = bindTo(
      userModel,
      { pwd: 'value', name: 'theName', },
      {
        onChange: {
          name: e => {
            return e.target.value + 'is name';
          },
          pwd: e => {
            return e.target.value + 'is value';
          },
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
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);

    const newValue = 'hello';

    target.simulate('change', { target: { value: newValue, }, });

    expect(getInputValue(target.find('input').at(0))).toBe(
      newValue + 'is value'
    );
    expect(
      lugiax
        .getState()
        .get(model)
        .get('pwd')
    ).toBe(newValue + 'is value');
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe(newValue + 'is name');
  });

  it('bindTo pwd: value onClick & name: theName onChange age is Default', () => {
    const name = 'ligx';
    const pwd = '123456';
    const age = 100;
    const userModel = createUserModel(name, pwd, age);

    const BindInput = bindTo(
      userModel,
      { pwd: 'value', name: 'theName', age: 'theAge', },
      {
        onChange: {
          name: e => {
            return e.target.value + 'is name';
          },
        },
        onClick: {
          pwd: e => {
            return e.target.value + 'is value';
          },
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
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);
    expect(target.find(Input).props().theAge).toBe(age);

    const newValue = 'hello';

    target.simulate('change', { target: { value: newValue, }, });
    expect(target.find(Input).props().theAge).toBe(newValue);
    expect(
      lugiax
        .getState()
        .get(model)
        .get('name')
    ).toBe(newValue + 'is name');

    expect(
      lugiax
        .getState()
        .get(model)
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);

    target.simulate('click', { target: { value: newValue, }, });

    expect(
      lugiax
        .getState()
        .get(model)
        .get('pwd')
    ).toBe(newValue + 'is value');
    expect(getInputValue(target.find('input').at(0))).toBe(
      newValue + 'is value'
    );
  });
});
