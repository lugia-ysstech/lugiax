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
import { getInputValue, } from './utils';

Enzyme.configure({ adapter: new Adapter(), });

const name = '︿(￣︶￣)︿';

class Input extends React.Component<any, any> {
  onClick = () => {
    this.props.changeName({ name, });
  };

  render() {
    const { name, pwd, mask, } = this.props;
    return [
      <input value={name} />,
      <input value={pwd} />,
      <input value={mask} />,
      <button onClick={this.onClick} />,
    ];
  }
}

describe('lugiax.connect', () => {
  beforeEach(() => {
    lugiax.clear();
  });

  it('connect only one model', () => {
    oneModelCase();
  });

  function createUserModel(name, pwd) {
    const model = 'user';

    const state = {
      name,
      pwd,
    };
    return lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName(data: Object, inParam: Object) {
            return data.set('name', inParam.name);
          },
        },
        async: {
          async changePwd(data: Object, inParam: Object) {
            return data.set('pwd', inParam.pwd);
          },
        },
      },
    });
  }

  function oneModelCase() {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createUserModel(name, pwd);
    const MyInput = connect(
      userModel,
      (state: Object) => {
        const { user, } = state;
        return {
          name: user.get('name'),
          pwd: user.get('pwd'),
        };
      },
      ({ user, }) => ({ changeName: user.changeName, })
    )(Input);

    const mask = "I'm mask";
    const target = mount(<MyInput mask={mask} />);

    expect(getInputValue(target.find('input').at(0))).toBe(name);
    expect(getInputValue(target.find('input').at(1))).toBe(pwd);
    expect(getInputValue(target.find('input').at(2))).toBe(mask);
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

  it('connect only one model for async state change', async () => {
    const { target, userModel, } = oneModelCase();
    const {
      mutations: { asyncChangePwd, },
    } = userModel;
    const pwd = '1234567';
    await asyncChangePwd({ pwd, });
    expect(getInputValue(target.find('input').at(1))).toBe(pwd);
  });

  function createInfoModel(info: any = '') {
    return lugiax.register({
      model: 'info',
      state: { info, },
      mutations: {
        sync: {
          changeInfo(data: Object, inParam: Object) {
            return data.set('info', inParam.value);
          },
        },
      },
    });
  }

  it('connect only render by model "user" ', () => {
    const name = 'ligx';
    const pwd = 'helol';
    const userModel = createUserModel(name, pwd);

    const {
      mutations: { changeInfo, },
    } = createInfoModel();

    let renderCnt = 0;

    const MyInput = connect(
      userModel,
      (state: Object) => {
        const { user, } = state;
        return {
          name: user.get('name'),
          pwd: user.get('pwd'),
        };
      }
    )(
      class extends React.Component<any> {
        render() {
          renderCnt++;
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
          ];
        }
      }
    );
    const target = mount(<MyInput />);
    expect(renderCnt).toBe(1);
    changeInfo({ value: 'helolo', });
    expect(renderCnt).toBe(1);
    const {
      mutations: { changeName, },
    } = userModel;
    expect(getInputValue(target.find('input').at(0))).toBe(name);
    expect(getInputValue(target.find('input').at(1))).toBe(pwd);
    const newName = 'abcd';
    changeName({ name: newName, });

    expect(getInputValue(target.find('input').at(0))).toBe(newName);
    expect(getInputValue(target.find('input').at(1))).toBe(pwd);

    expect(renderCnt).toBe(2);
  });

  it('connect twoModel ', () => {
    const name = 'ligx';
    const pwd = 'helol';
    const info = 'info';
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);

    const MyInput = connect(
      [userModel, infoModel,],
      (state: Object) => {
        const { user, info, } = state;
        return {
          name: user.get('name'),
          pwd: user.get('pwd'),
          info: info.get('info'),
        };
      }
    )(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />,
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(getInputValue(target.find('input').at(0))).toBe(name);
    expect(getInputValue(target.find('input').at(1))).toBe(pwd);
    expect(getInputValue(target.find('input').at(2))).toBe(info);
  });
  it('connect only one model for state change by click', () => {
    const { target, } = oneModelCase();

    target.find('button').simulate('click');
    expect(getInputValue(target.find('input').at(0))).toBe(name);
  });
});
