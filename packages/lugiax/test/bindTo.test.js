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
import { bindTo, } from '../src/';
import { getPathArray, gettor, settor, } from '../src/bindTo';
import { createDeepUserModel, createUserModel, getInputValue, } from './utils';
import immutable, { getIn, } from 'immutable';

Enzyme.configure({ adapter: new Adapter(), });

class Input extends React.Component<any, any> {
  render() {
    const { value = '', } = this.props;
    return <input {...this.props} value={value === null ? '' : value} />;
  }
}

function statisticsRenderCountFn(statistics, name) {
  statistics[name] = statistics[name] ? ++statistics[name] : 1;
  return statistics;
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

    const BindInput = bindTo(userModel, { pwd: 'value', })(Input);

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
  it('bindTo Repeat', () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createUserModel(name, pwd);

    const BindInputA = bindTo(userModel, { pwd: 'value', })(Input);
    const BindInputB = bindTo(userModel, { pwd: 'value', })(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInputA />;
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
  it('bindTo has props ', () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createUserModel(name, pwd);

    const BindInputA = bindTo(userModel, { pwd: 'value', })(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInputA value={'hello'} />;
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
    expect(getInputValue(target.find('input').at(0))).toBe('hello');
  });

  it('bindTo pwd: value & name: theName ', () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createUserModel(name, pwd);

    const BindInput = bindTo(
      userModel,
      { pwd: 'value', name: 'theName', }, // 模型绑定
      {
        onChange: {
          // 事件响应处理模型更新
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

    expect(getInputValue(target.find('input').at(0))).toBe(newValue + 'is value');
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
    expect(getInputValue(target.find('input').at(0))).toBe(newValue + 'is value');
  });

  it('gettor', () => {
    const im = immutable.fromJS({ name: 'hello', });
    const get = gettor(im, 'name');
    expect(get()).toBe(im.get('name'));
  });

  it('gettor obj.info.name', () => {
    const im = immutable.fromJS({ info: { name: 'hello', }, });
    const get = gettor(im, 'info.name');
    expect(get()).toBe(im.get('info').get('name'));
  });
  it('gettor obj.info[0]', () => {
    const im = immutable.fromJS({ info: [1000,], });
    const get = gettor(im, 'info[0]');
    expect(get()).toBe(im.get('info').get(0));
  });

  it('gettor obj.info[0]', () => {
    const data = Array(...new Array(100)).map(call, Number);
    const im = immutable.fromJS({ info: data, });
    const get = gettor(im, 'info[99]');
    expect(get()).toBe(im.get('info').get(99));
  });
  const call: any = Function.call;

  it('gettor obj.info[0].name', () => {
    const data = Array(...new Array(100))
      .map(call, Number)
      .map(i => ({ name: `name:${i}`, }));
    const im = immutable.fromJS({ info: data, });
    const get = gettor(im, 'info[99].name');
    expect(get()).toBe(
      im
        .get('info')
        .get(99)
        .get('name')
    );
  });

  it('settor', () => {
    const im = immutable.fromJS({ name: 'hello', });
    const newValue = 'kxy';
    const set = settor(im, 'name');
    const res = set(newValue);
    expect(res.get('name')).toBe(newValue);
  });

  it('settor obj.info.name', () => {
    const im = immutable.fromJS({ info: { name: 'hello', }, });
    const set = settor(im, 'info.name');
    const newValue = 'kxy';
    const res = set(newValue);
    expect(res.get('info').get('name')).toBe(newValue);
  });

  it('settor obj.info[0]', () => {
    const im = immutable.fromJS({ info: [1000,], });
    const set = settor(im, 'info[0]');
    const newValue = 10002;
    const res = set(newValue);
    expect(res.get('info').get(0)).toBe(newValue);
  });

  it('settor obj.info[99]', () => {
    const data = Array(...new Array(100)).map(call, Number);
    const im = immutable.fromJS({ info: data, });
    const set = settor(im, 'info[99]');
    const newValue = 10002;
    const res = set(newValue);
    expect(res.get('info').get(99)).toBe(newValue);
  });

  it('settor obj.info[0].name', () => {
    const data = Array(...new Array(100))
      .map(call, Number)
      .map(i => ({ name: `name:${i}`, }));
    const im = immutable.fromJS({ info: data, });
    const set = settor(im, 'info[99].name');
    const newValue = 10002;
    const res = set(newValue);
    expect(
      res
        .get('info')
        .get(99)
        .get('name')
    ).toBe(newValue);
  });

  it('getPathArray', () => {
    expect(getPathArray('data')).toEqual(['data',]);
    expect(getPathArray('data.a.b.c')).toEqual(['data', 'a', 'b', 'c',]);
    expect(getPathArray('data[0].a.b.c')).toEqual(['data', '0', 'a', 'b', 'c',]);
    expect(getPathArray('data[0].a[1].b.c[3]')).toEqual(['data', '0', 'a', '1', 'b', 'c', '3',]);
    expect(getPathArray('data[111]')).toEqual(['data', '111',]);
  });

  it('bindTo  deep default', () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createDeepUserModel(name, pwd);

    const BindInput = bindTo(userModel, 'form.name')(Input);

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
        .get('form')
        .get('name')
    ).toBe(name);
    expect(getInputValue(target.find('input').at(0))).toBe(name);

    const newName = 'my name is ';
    target.simulate('change', { target: { value: newName, }, });
    expect(
      lugiax
        .getState()
        .get(model)
        .get('form')
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
        .get('form')
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

  it('bindTo Pwd to Value Props for deepModel', () => {
    const name = 'ligx';
    const pwd = '123456';
    const age = 15;
    const phone = ['a', 'b', 'c',];
    const userModel = createDeepUserModel(name, pwd, age, phone);

    const BindInput = bindTo(userModel, { 'form.phone[1]': 'value', })(Input);

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
        .get('form')
        .get('phone')
        .get(1)
    ).toBe(phone[1]);
    expect(getInputValue(target.find('input').at(0))).toBe(phone[1]);
  });

  it('bindTo form.phone[1] to two Props value & label for deepModel', () => {
    const name = 'ligx';
    const pwd = '123456';
    const age = 15;
    const phone = ['a', 'b', 'c',];
    const userModel = createDeepUserModel(name, pwd, age, phone);

    const BindInput = bindTo(userModel, {
      'form.phone[1]': ['value', 'label',],
    })(Input);

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
        .get('form')
        .get('phone')
        .get(1)
    ).toBe(phone[1]);
    expect(target.find(Input).props().value).toBe(phone[1]);
    expect(target.find(Input).props().label).toBe(phone[1]);
    expect(getInputValue(target.find('input').at(0))).toBe(phone[1]);
  });

  it('bindTo pwd: value  name: theName different eventHandle  for deepModel', () => {
    const name = 'ligx';
    const pwd = '123456';
    const age = 15;
    const phone = ['a', 'b', 'c',];
    const userModel = createDeepUserModel(name, pwd, age, phone);

    const BindInput = bindTo(
      userModel,
      { 'form.pwd': 'value', 'form.name': 'theName', },
      {
        onChange: {
          'form.name': e => {
            return e.target.value + 'is name';
          },
          'form.pwd': e => {
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
        .get('form')
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);

    const newValue = 'hello';

    target.simulate('change', { target: { value: newValue, }, });

    expect(getInputValue(target.find('input').at(0))).toBe(newValue + 'is value');
    expect(
      lugiax
        .getState()
        .get(model)
        .get('form')
        .get('pwd')
    ).toBe(newValue + 'is value');
    expect(
      lugiax
        .getState()
        .get(model)
        .get('form')
        .get('name')
    ).toBe(newValue + 'is name');
  });

  it('bindTo pwd: value onClick & name: theName onChange age is Default   for deepModel', () => {
    const name = 'ligx';
    const pwd = '123456';
    const age = 15;
    const phone = ['a', 'b', 'c',];
    const userModel = createDeepUserModel(name, pwd, age, phone);

    const BindInput = bindTo(
      userModel,
      {
        'form.pwd': 'value',
        'form.name': 'theName',
        'form.phone[1]': 'thePhone',
      },
      {
        onChange: {
          'form.name': e => {
            return e.target.value + 'is name';
          },
        },
        onClick: {
          'form.pwd': e => {
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
        .get('form')
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);
    expect(target.find(Input).props().thePhone).toBe(phone[1]);

    const newValue = 'hello';

    target.simulate('change', { target: { value: newValue, }, });
    expect(target.find(Input).props().thePhone).toBe(newValue);
    expect(
      lugiax
        .getState()
        .get(model)
        .get('form')
        .get('name')
    ).toBe(newValue + 'is name');

    expect(
      lugiax
        .getState()
        .get(model)
        .get('form')
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);

    target.simulate('click', { target: { value: newValue, }, });

    expect(
      lugiax
        .getState()
        .get(model)
        .get('form')
        .get('pwd')
    ).toBe(newValue + 'is value');
    expect(getInputValue(target.find('input').at(0))).toBe(newValue + 'is value');
  });

  it('EventHandle onClick', async () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createDeepUserModel(name, pwd);

    let MyInput = Input;
    const changePromise = new Promise(res => {
      MyInput = bindTo(
        userModel,
        {},
        {},
        {
          eventHandle: {
            onClick(e) {
              res(e.target.value);
            },
          },
        }
      )(Input);
    });
    const target = mount(<MyInput />);
    target.find(Input).simulate('click', { target: { value: name, }, });
    expect(await changePromise).toBe(name);
  });

  it('EventHandle onChange and MyInput has onChange', async () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createDeepUserModel(name, pwd);

    let MyInput = Input;
    const changePromise = new Promise(res => {
      MyInput = bindTo(
        userModel,
        {},
        {},
        {
          eventHandle: {
            onChange(e) {
              res(e.target.value);
            },
          },
        }
      )(Input);
    });
    let onChange;
    const theChangeEvent = new Promise(res => {
      onChange = e => {
        res(e.target.value);
      };
    });
    const target = mount(<MyInput onChange={onChange} />);
    target.find(Input).simulate('change', { target: { value: name, }, });
    expect(await changePromise).toBe(name);
    expect(await theChangeEvent).toBe(name);
  });

  it('EventHandle onChange and MyInput has onChange and has ChangeMutation', async () => {
    const name = 'ligx';
    const pwd = '123456';
    const userModel = createDeepUserModel(name, pwd);

    let MyInput = Input;
    const changePromise = new Promise(res => {
      MyInput = bindTo(
        userModel,
        {
          'form.name': 'value',
        },
        {},
        {
          eventHandle: {
            onChange(e) {
              res(e.target.value);
            },
          },
        }
      )(Input);
    });

    let onChange;
    const theChangeEvent = new Promise(res => {
      onChange = e => {
        res(e.target.value);
      };
    });
    const newName = '无可奈何而安之若命';
    const target = mount(<MyInput onChange={onChange} />);

    target.find(Input).simulate('change', { target: { value: newName, }, });
    expect(getInputValue(target.find('input').at(0))).toBe(newName);
    expect(
      lugiax
        .getState()
        .get(userModel.model)
        .getIn(['form', 'name',])
    ).toBe(newName);
    expect(await changePromise).toBe(newName);
    expect(await theChangeEvent).toBe(newName);
  });

  it('bindTo add default AreStateEqual function to prevent component render && bindConfig is string && simpleModel', () => {
    const model = 'user';
    const name1 = 'name';
    const name2 = 'name';
    const name3 = 'name';
    const name4 = 'name';
    const statistics = {};
    const state = {
      name1,
      name2,
      name3,
      name4,
    };
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName1(data: Object, inParam: Object) {
            return data.set('name1', inParam.name1);
          },
          changeName2(data: Object, inParam: Object) {
            return data.set('name2', inParam.name2);
          },
          changeName3(data: Object, inParam: Object) {
            return data.set('name3', inParam.name3);
          },
          changeName4(data: Object, inParam: Object) {
            return data.set('name4', inParam.name4);
          },
        },
      },
    });

    class Input1 extends React.Component<any, any> {
      displayName = 'name1';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input2 extends React.Component<any, any> {
      displayName = 'name2';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input3 extends React.Component<any, any> {
      displayName = 'name3';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input4 extends React.Component<any, any> {
      displayName = 'name4';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }

    const BindInput1 = bindTo(userModel, 'name1')(Input1);
    const BindInput2 = bindTo(userModel, 'name2')(Input2);
    const BindInput3 = bindTo(userModel, 'name3')(Input3);
    const BindInput4 = bindTo(userModel, 'name4')(Input4);
    const {
      mutations: { changeName1, changeName2, changeName3, changeName4, },
    } = userModel;

    class App extends React.Component<any, any> {
      render() {
        return [<BindInput1 />, <BindInput2 />, <BindInput3 />, <BindInput4 />,];
      }
    }
    const target = mount(<App />);

    expect(getInputValue(target.find('input').at(0))).toBe(name1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(1);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
    const newName1 = '2222';
    changeName1({ name1: newName1, });
    expect(getInputValue(target.find('input').at(0))).toBe(newName1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(2);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
  });

  it('bindTo add default AreStateEqual function to prevent component render  && bindConfig is object && simpleModel ', () => {
    const model = 'user';
    const name1 = 'name';
    const name2 = 'name';
    const name3 = 'name';
    const name4 = 'name';
    const statistics = {};
    const state = {
      name1,
      name2,
      name3,
      name4,
    };
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName1(data: Object, inParam: Object) {
            return data.set('name1', inParam.name1);
          },
          changeName2(data: Object, inParam: Object) {
            return data.set('name2', inParam.name2);
          },
          changeName3(data: Object, inParam: Object) {
            return data.set('name3', inParam.name3);
          },
          changeName4(data: Object, inParam: Object) {
            return data.set('name4', inParam.name4);
          },
        },
      },
    });

    class Input1 extends React.Component<any, any> {
      displayName = 'name1';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input2 extends React.Component<any, any> {
      displayName = 'name2';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input3 extends React.Component<any, any> {
      displayName = 'name3';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input4 extends React.Component<any, any> {
      displayName = 'name4';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }

    const BindInput1 = bindTo(userModel, {
      name1: 'value',
    })(Input1);
    const BindInput2 = bindTo(userModel, {
      name2: 'value',
    })(Input2);
    const BindInput3 = bindTo(userModel, {
      name3: 'value',
    })(Input3);
    const BindInput4 = bindTo(userModel, {
      name4: 'value',
    })(Input4);
    const {
      mutations: { changeName1, changeName2, changeName3, changeName4, },
    } = userModel;

    class App extends React.Component<any, any> {
      render() {
        return [<BindInput1 />, <BindInput2 />, <BindInput3 />, <BindInput4 />,];
      }
    }
    const target = mount(<App />);

    expect(getInputValue(target.find('input').at(0))).toBe(name1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(1);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
    const newName1 = '2222';
    changeName1({ name1: newName1, });
    expect(getInputValue(target.find('input').at(0))).toBe(newName1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(2);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
  });

  it('bindTo add default AreStateEqual function to prevent component render && bindConfig is string && deepModel', () => {
    const model = 'user';
    const name1 = 'name';
    const name2 = 'name';
    const name3 = 'name';
    const name4 = 'name';
    const statistics = {};
    const state = {
      form: {
        name1,
        name2,
        name3,
        name4,
      },
    };
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName1(data: Object, inParam: Object) {
            const form = data.get('form');
            return data.set('form', form.set('name1', inParam.name1));
          },
          changeName2(data: Object, inParam: Object) {
            const form = data.get('form');
            return data.set('form', form.set('name2', inParam.name2));
          },
          changeName3(data: Object, inParam: Object) {
            const form = data.get('form');
            return data.set('form', form.set('name3', inParam.name3));
          },
          changeName4(data: Object, inParam: Object) {
            const form = data.get('form');
            return data.set('form', form.set('name4', inParam.name4));
          },
        },
      },
    });

    class Input1 extends React.Component<any, any> {
      displayName = 'name1';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input2 extends React.Component<any, any> {
      displayName = 'name2';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input3 extends React.Component<any, any> {
      displayName = 'name3';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input4 extends React.Component<any, any> {
      displayName = 'name4';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }

    const BindInput1 = bindTo(userModel, 'form.name1')(Input1);
    const BindInput2 = bindTo(userModel, 'form.name2')(Input2);
    const BindInput3 = bindTo(userModel, 'form.name3')(Input3);
    const BindInput4 = bindTo(userModel, 'form.name4')(Input4);
    const {
      mutations: { changeName1, changeName2, changeName3, changeName4, },
    } = userModel;

    class App extends React.Component<any, any> {
      render() {
        return [<BindInput1 />, <BindInput2 />, <BindInput3 />, <BindInput4 />,];
      }
    }
    const target = mount(<App />);

    expect(getInputValue(target.find('input').at(0))).toBe(name1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(1);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
    const newName1 = '2222';
    changeName1({ name1: newName1, });
    expect(getInputValue(target.find('input').at(0))).toBe(newName1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(2);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
  });

  it('bindTo add default AreStateEqual function to prevent component render && bindConfig is Object && deepModel', () => {
    const model = 'user';
    const name1 = 'name';
    const name2 = 'name';
    const name3 = 'name';
    const name4 = 'name';
    const statistics = {};
    const state = {
      form: {
        name1,
        name2,
        name3,
        name4,
      },
    };
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName1(data: Object, inParam: Object) {
            const form = data.get('form');
            return data.set('form', form.set('name1', inParam.name1));
          },
          changeName2(data: Object, inParam: Object) {
            const form = data.get('form');
            return data.set('form', form.set('name2', inParam.name2));
          },
          changeName3(data: Object, inParam: Object) {
            const form = data.get('form');
            return data.set('form', form.set('name3', inParam.name3));
          },
          changeName4(data: Object, inParam: Object) {
            const form = data.get('form');
            return data.set('form', form.set('name4', inParam.name4));
          },
        },
      },
    });

    class Input1 extends React.Component<any, any> {
      displayName = 'name1';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input2 extends React.Component<any, any> {
      displayName = 'name2';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input3 extends React.Component<any, any> {
      displayName = 'name3';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input4 extends React.Component<any, any> {
      displayName = 'name4';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }

    const BindInput1 = bindTo(userModel, { 'form.name1': 'value', })(Input1);
    const BindInput2 = bindTo(userModel, { 'form.name2': 'value', })(Input2);
    const BindInput3 = bindTo(userModel, { 'form.name3': 'value', })(Input3);
    const BindInput4 = bindTo(userModel, { 'form.name4': 'value', })(Input4);
    const {
      mutations: { changeName1, changeName2, changeName3, changeName4, },
    } = userModel;

    class App extends React.Component<any, any> {
      render() {
        return [<BindInput1 />, <BindInput2 />, <BindInput3 />, <BindInput4 />,];
      }
    }
    const target = mount(<App />);

    expect(getInputValue(target.find('input').at(0))).toBe(name1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(1);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
    const newName1 = '2222';
    changeName1({ name1: newName1, });
    expect(getInputValue(target.find('input').at(0))).toBe(newName1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(2);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
  });

  it('bindTo add default AreStateEqual function to prevent component render, mutations call twice', () => {
    const model = 'user';
    const name1 = 'name';
    const name2 = 'name';
    const name3 = 'name';
    const name4 = 'name';
    const statistics = {};
    const state = {
      name1,
      name2,
      name3,
      name4,
    };
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName1(data: Object, inParam: Object) {
            return data.set('name1', inParam.name1);
          },
          changeName2(data: Object, inParam: Object) {
            return data.set('name2', inParam.name2);
          },
          changeName3(data: Object, inParam: Object) {
            return data.set('name3', inParam.name3);
          },
          changeName4(data: Object, inParam: Object) {
            return data.set('name4', inParam.name4);
          },
        },
      },
    });

    class Input1 extends React.Component<any, any> {
      displayName = 'name1';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input2 extends React.Component<any, any> {
      displayName = 'name2';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input3 extends React.Component<any, any> {
      displayName = 'name3';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input4 extends React.Component<any, any> {
      displayName = 'name4';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }

    const BindInput1 = bindTo(userModel, {
      name1: 'value',
    })(Input1);
    const BindInput2 = bindTo(userModel, {
      name2: 'value',
    })(Input2);
    const BindInput3 = bindTo(userModel, {
      name3: 'value',
    })(Input3);
    const BindInput4 = bindTo(userModel, {
      name4: 'value',
    })(Input4);
    const {
      mutations: { changeName1, changeName2, changeName3, changeName4, },
    } = userModel;

    class App extends React.Component<any, any> {
      render() {
        return [<BindInput1 />, <BindInput2 />, <BindInput3 />, <BindInput4 />,];
      }
    }
    const target = mount(<App />);

    expect(getInputValue(target.find('input').at(0))).toBe(name1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(1);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
    const newName1 = '2222';
    changeName1({ name1: newName1, });
    expect(getInputValue(target.find('input').at(0))).toBe(newName1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(2);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
    const newName = '3333';
    changeName2({ name2: newName, });
    expect(getInputValue(target.find('input').at(0))).toBe(newName1);
    expect(getInputValue(target.find('input').at(1))).toBe(newName);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(2);
    expect(statistics.name2).toBe(2);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
  });

  it('bindTo add default AreStateEqual function to prevent component render, component Components share a model source', () => {
    const model = 'user';
    const name1 = 'name';
    const name2 = 'name';
    const name3 = 'name';
    const name4 = 'name';
    const statistics = {};
    const state = {
      name1,
      name2,
      name3,
      name4,
    };
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName1(data: Object, inParam: Object) {
            return data.set('name1', inParam.name1);
          },
          changeName2(data: Object, inParam: Object) {
            return data.set('name2', inParam.name2);
          },
          changeName3(data: Object, inParam: Object) {
            return data.set('name3', inParam.name3);
          },
          changeName4(data: Object, inParam: Object) {
            return data.set('name4', inParam.name4);
          },
        },
      },
    });

    class Input1 extends React.Component<any, any> {
      displayName = 'name1';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input2 extends React.Component<any, any> {
      displayName = 'name2';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', hell = '', } = this.props;
        return [
          <input {...this.props} value={value === null ? '' : value} />,
          <input value={hell === null ? '' : hell} />,
        ];
      }
    }
    class Input3 extends React.Component<any, any> {
      displayName = 'name3';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }
    class Input4 extends React.Component<any, any> {
      displayName = 'name4';
      render() {
        statisticsRenderCountFn(statistics, this.displayName);
        const { value = '', } = this.props;
        return <input {...this.props} value={value === null ? '' : value} />;
      }
    }

    const BindInput1 = bindTo(userModel, {
      name1: 'value',
    })(Input1);
    const BindInput2 = bindTo(userModel, {
      name2: 'value',
      name1: 'hell',
    })(Input2);
    const BindInput3 = bindTo(userModel, {
      name3: 'value',
    })(Input3);
    const BindInput4 = bindTo(userModel, {
      name4: 'value',
    })(Input4);
    const {
      mutations: { changeName1, changeName2, changeName3, changeName4, },
    } = userModel;

    class App extends React.Component<any, any> {
      render() {
        return [<BindInput1 />, <BindInput2 />, <BindInput3 />, <BindInput4 />,];
      }
    }
    const target = mount(<App />);

    expect(getInputValue(target.find('input').at(0))).toBe(name1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(name3);
    expect(getInputValue(target.find('input').at(3))).toBe(name4);
    expect(statistics.name1).toBe(1);
    expect(statistics.name2).toBe(1);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
    const newName1 = '2222';
    changeName1({ name1: newName1, });
    expect(getInputValue(target.find('input').at(0))).toBe(newName1);
    expect(getInputValue(target.find('input').at(1))).toBe(name2);
    expect(getInputValue(target.find('input').at(2))).toBe(newName1);
    expect(getInputValue(target.find('input').at(3))).toBe(name3);
    expect(getInputValue(target.find('input').at(4))).toBe(name4);
    expect(statistics.name1).toBe(2);
    expect(statistics.name2).toBe(2);
    expect(statistics.name3).toBe(1);
    expect(statistics.name4).toBe(1);
  });

  it('bindTo register no mutations in Model', () => {
    const modelName = 'user';
    const pwd = '123456';
    const userName = 'admin';
    const state = {
      pwd,
      userName,
    };
    const userModel = lugiax.register({
      model: modelName,
      state,
    });
    const BindInputA = bindTo(userModel, { pwd: 'value', userName, })(Input);
    class App extends React.Component<any, any> {
      render() {
        return <BindInputA />;
      }
    }
    const target = mount(<App />);
    const { model, mutations, } = userModel;
    const keys = Object.keys(state);
    expect(
      lugiax
        .getState()
        .get(modelName)
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);
    const newValueObject = {
      pwd: 'pwd新值',
      userName: 'name新值',
    };
    // 查看mutations有没有自动注入mutations；调用和是否修改lugaix中的值
    for (let i = 0; i < keys.length; i++) {
      mutations[`_alugiax_change${keys[i]}`]({ value: newValueObject[keys[i]], });
      expect(
        lugiax
          .getState()
          .get(modelName)
          .get(keys[i])
      ).toBe(newValueObject[keys[i]]);
    }
    target.simulate('change', { target: { value: newValueObject.pwd, }, });
    expect(getInputValue(target.find('input').at(0))).toBe(newValueObject.pwd);
  });

  it('bindTo register mutations is null in  Model', () => {
    const modelName = 'user';
    const pwd = '123456';
    const userName = 'admin';
    const state = {
      pwd,
      userName,
    };
    const userModel = lugiax.register({
      model: modelName,
      state,
      mutations: null,
    });
    const BindInputA = bindTo(userModel, { pwd: 'value', userName, })(Input);
    class App extends React.Component<any, any> {
      render() {
        return <BindInputA />;
      }
    }
    const target = mount(<App />);
    const { model, mutations, } = userModel;
    const keys = Object.keys(state);
    expect(
      lugiax
        .getState()
        .get(modelName)
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);
    const newValueObject = {
      pwd: 'pwd新值',
      userName: 'name新值',
    };
    // 查看mutations有没有自动注入mutations；调用和是否修改lugaix中的值
    for (let i = 0; i < keys.length; i++) {
      mutations[`_alugiax_change${keys[i]}`]({ value: newValueObject[keys[i]], });
      expect(
        lugiax
          .getState()
          .get(modelName)
          .get(keys[i])
      ).toBe(newValueObject[keys[i]]);
    }
    target.simulate('change', { target: { value: newValueObject.pwd, }, });
    expect(getInputValue(target.find('input').at(0))).toBe(newValueObject.pwd);
  });

  it('bindTo register mutations is undefined in  Model', () => {
    const modelName = 'user';
    const pwd = '123456';
    const userName = 'admin';
    const state = {
      pwd,
      userName,
    };
    const userModel = lugiax.register({
      model: modelName,
      state,
      mutations: undefined,
    });
    const BindInputA = bindTo(userModel, { pwd: 'value', userName, })(Input);
    class App extends React.Component<any, any> {
      render() {
        return <BindInputA />;
      }
    }
    const target = mount(<App />);
    const { model, mutations, } = userModel;
    const keys = Object.keys(state);
    expect(
      lugiax
        .getState()
        .get(modelName)
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(pwd);
    const newValueObject = {
      pwd: 'pwd新值',
      userName: 'name新值',
    };
    // 查看mutations有没有自动注入mutations；调用和是否修改lugaix中的值
    for (let i = 0; i < keys.length; i++) {
      mutations[`_alugiax_change${keys[i]}`]({ value: newValueObject[keys[i]], });
      expect(
        lugiax
          .getState()
          .get(modelName)
          .get(keys[i])
      ).toBe(newValueObject[keys[i]]);
    }
    target.simulate('change', { target: { value: newValueObject.pwd, }, });
    expect(getInputValue(target.find('input').at(0))).toBe(newValueObject.pwd);
  });

  it('bindTo config getterParse', () => {
    const modelName = 'user';
    const pwd = '123456';
    const userName = 'admin';
    const state = {
      pwd,
      userName,
    };
    const userModel = lugiax.register({
      model: modelName,
      state,
    });
    function parse(val: any): any {
      return `${val}_parse`;
    }
    const BindInputA = bindTo(
      userModel,
      { pwd: 'value', userName, },
      {},
      {
        getterParse: parse,
      }
    )(Input);
    class App extends React.Component<any, any> {
      render() {
        return <BindInputA />;
      }
    }
    const target = mount(<App />);
    expect(
      lugiax
        .getState()
        .get(modelName)
        .get('pwd')
    ).toBe(pwd);
    expect(getInputValue(target.find('input').at(0))).toBe(parse(pwd));
    const newValueObject = {
      pwd: 'pwd新值',
      userName: 'name新值',
    };
    target.simulate('change', { target: { value: newValueObject.pwd, }, });
    expect(getInputValue(target.find('input').at(0))).toBe(parse(newValueObject.pwd));
  });

  function testGetterParseEmpty(targetEmpty: any) {
    it(`bindTo config getterParse ${targetEmpty}`, () => {
      const modelName = 'user';
      const pwd = '123456';
      const userName = 'admin';
      const state = {
        pwd,
        userName,
      };
      const userModel = lugiax.register({
        model: modelName,
        state,
      });
      const BindInputA = bindTo(
        userModel,
        { pwd: 'value', userName, },
        {},
        {
          getterParse: targetEmpty,
        }
      )(Input);
      class App extends React.Component<any, any> {
        render() {
          return <BindInputA />;
        }
      }
      const target = mount(<App />);
      expect(
        lugiax
          .getState()
          .get(modelName)
          .get('pwd')
      ).toBe(pwd);
      expect(getInputValue(target.find('input').at(0))).toBe(pwd);
      const newValueObject = {
        pwd: 'pwd新值',
        userName: 'name新值',
      };
      target.simulate('change', { target: { value: newValueObject.pwd, }, });
      expect(getInputValue(target.find('input').at(0))).toBe(newValueObject.pwd);
    });
  }

  testGetterParseEmpty(null);
  testGetterParseEmpty(undefined);
  testGetterParseEmpty(5);
  testGetterParseEmpty('ligx');
  testGetterParseEmpty([]);
  testGetterParseEmpty({});
});
