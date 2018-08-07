/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax-core';
import { connect, } from '../lib';
import React from 'react';
import Enzyme, { mount, } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter(), });

class Input extends React.Component<any, any> {
  render() {
    const { name, pwd, mask, } = this.props;
    return [
      <input value={name} />,
      <input value={pwd} />,
      <input value={mask} />,
    ];
  }
}

function getInputValue(component): any {
  const target = getInputDomNode(component);
  if (target) {
    return target.value;
  }
  return '';
}

function getInputDomNode(component): HTMLInputElement | null {
  const result = component.getDOMNode();
  if (result instanceof HTMLInputElement) {
    return result;
  }
  return null;
}

describe('lugiax', () => {
  beforeEach(() => {
    lugiax.clear();
  });

  it('connect only one model', () => {
    oneModelCase();
  });

  function oneModelCase() {
    const model = 'user';
    const name = 'ligx';
    const pwd = '123456';
    const state = {
      name,
      pwd,
    };
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName(data: Object, inParam: Object) {
            return data.set('name', inParam.name);
          },
        },
      },
    });
    const MyInput = connect(
      Input,
      userModel,
      (state: Object) => {
        const { user, } = state;
        return {
          name: user.get('name'),
          pwd: user.get('pwd'),
        };
      }
    );

    const target = mount(<MyInput />);

    expect(getInputValue(target.find('input').at(0))).toBe(name);
    expect(getInputValue(target.find('input').at(1))).toBe(pwd);
    return { target, userModel, };
  }

  it('connect only one model for state change', () => {
    const { target, userModel, } = oneModelCase();
    const {
      mutations: { changeName, },
    } = userModel;
    const name = 'hello new name';
    changeName({ name, });
    expect(getInputValue(target.find('input').at(0))).toBe(name);
  });
});
