import lugiax from '@lugia/lugiax-core';
import { connect, } from '../src';
import React from 'react';
import Enzyme, { mount, } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createUserModel, getInputValue, } from './utils';
Enzyme.configure({ adapter: new Adapter(), });
const EventEmitter = require('events').EventEmitter;
describe('content Other test', () => {
  beforeEach(() => {
    lugiax.clear();
  });
  it('content change modelState trigger A-Component render . when lifeCycle function again  trigger  change modelState ', async () => {
    const promiseEvent = new EventEmitter();
    const testOneModel = lugiax.register({
      model: 'test-one',
      state: {
        list: [],
      },
      mutations: {
        async: {
          async getData(state, values, { getState, }) {
            const list = await new Promise(res => {
              setTimeout(() => {
                res(values);
              }, 200);
            }).then(data => {
              promiseEvent.emit('update');
              return data;
            });
            return getState().set('list', list);
          },
        },
      },
    });
    const testTwoModel = lugiax.register({
      model: 'test-two',
      state: {
        list: [],
      },
      mutations: {
        async: {
          async getData(state, values, { getState, }) {
            const list = await new Promise(res => {
              setTimeout(() => {
                res(values);
              }, 100);
            }).then(data => {
              promiseEvent.emit('update');
              return data;
            });
            return getState().set('list', list);
          },
        },
      },
    });
    class TestOne extends React.Component {
      componentDidMount() {
        setTimeout(
          () =>
            this.props.getData([1,]).then(() => {
              promiseEvent.emit('update');
            }),
          100
        );
        setTimeout(
          () =>
            this.props.getData([1, 2,]).then(() => {
              promiseEvent.emit('update');
            }),
          200
        );
      }
      render() {
        return (
          <div>
            <h1>one组件</h1>
            数据展示: <span>{this.props.list}</span>
          </div>
        );
      }
    }
    class TestTwo extends React.Component {
      componentDidMount() {
        this.props.getData(this.props.oneList.map(item => item * 5)).then(() => {
          promiseEvent.emit('update');
        });
      }
      componentDidUpdate(prev) {
        if (this.props.oneList.join(',') !== prev.oneList.join(',')) {
          this.props.getData(this.props.oneList.map(item => item * 5)).then(() => {
            promiseEvent.emit('update');
          });
        }
      }
      render() {
        return (
          <div>
            <h1>two组件</h1>
            数据展示: <span>{this.props.twoList}</span>
          </div>
        );
      }
    }
    const TestOnesCom = connect(
      testOneModel,
      state => {
        return {
          list: state.get('list').toJS ? state.get('list').toJS() : state.get('list'),
        };
      },
      mutations => {
        return { getData: mutations.asyncGetData, };
      }
    )(TestOne);
    const TestTwosCom = connect(
      [testOneModel, testTwoModel,],
      state => ({
        oneList: state[0].get('list').toJS ? state[0].get('list').toJS() : state[0].get('list'),
        twoList: state[1].get('list').toJS ? state[1].get('list').toJS() : state[1].get('list'),
      }),
      mutations => ({
        getData: mutations[1].asyncGetData,
      })
    )(TestTwo);
    class TextContainer extends React.Component {
      render() {
        return (
          <div>
            <TestOnesCom></TestOnesCom>
            <TestTwosCom />
          </div>
        );
      }
    }
    const target = mount(<TextContainer />);
    let oneTxt = target
      .find('span')
      .at(0)
      .text();
    expect(oneTxt).toEqual('');
    let twoTxt = target
      .find('span')
      .at(1)
      .text();
    expect(twoTxt).toEqual('');
    const promise = new Promise(res => {
      let count = 0;
      const countFn = () => {
        count++;
        if (count === 8) {
          res('ok');
        }
      };
      promiseEvent.on('update', () => {
        countFn();
      });
    });
    await promise;
    oneTxt = target
      .find('span')
      .at(0)
      .text();
    expect(oneTxt).toEqual('12');
    twoTxt = target
      .find('span')
      .at(1)
      .text();
    expect(twoTxt).toEqual('510');
  });
});
