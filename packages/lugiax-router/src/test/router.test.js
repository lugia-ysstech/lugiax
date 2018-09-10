/**
 *
 * create by ligx
 *
 * @flow
 */
import React from 'react';
import Enzyme, { mount, } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import Main from './demo';
import { createApp, } from '../lib';
import lugiax from '@lugia/lugiax-core';
import { createMemoryHistory, } from 'history';
import { push, } from 'connected-react-router';

Enzyme.configure({ adapter: new Adapter(), });

describe('router', () => {
  let cmp;
  beforeAll(() => {
    const history = createMemoryHistory();
    const App = createApp(
      {
        '/': {
          component: Main,
        },
      },
      history
    );
    cmp = mount(<App />);
  });

  it('createApp', () => {
    const state = lugiax.getState();
    expect(state.get('todo').toJS()).toEqual({
      formData: {
        task: '',
      },
      tasks: ['hello',],
    });
    expect(state.get('tomato')).toBeUndefined();
    expect(
      state
        .get('router')
        .get('location')
        .toJS().pathname
    ).toBe('/');
  });

  it('url change', async () => {
    const targetUrl = '/todo';

    goUrl(targetUrl);

    const state = lugiax.getState();
    expect(
      state
        .get('router')
        .get('location')
        .toJS().pathname
    ).toBe(targetUrl);
    console.info('lgx before got sucess');
  });

  it('async url change', async () => {
    const targetUrl = '/tomato/history';
    goUrl(targetUrl);
    const state = lugiax.getState();
    expect(
      state
        .get('router')
        .get('location')
        .toJS().pathname
    ).toBe(targetUrl);

    await new Promise(res => {
      setTimeout(() => {
        expect(
          lugiax
            .getState()
            .get('tomato')
            .toJS()
        ).toEqual({
          tomotos: [],
          doing: false,
          time: 0,
          beginAt: '',
          taskName: '',
        });
        res(true);
      }, 200);
    });
  });

  it('todo', async () => {
    const targetUrl = '/todo';
    goUrl(targetUrl);
    cmp.update();

    const newTask = 'new Task';
    const input = cmp.find('input');
    input.simulate('change', { target: { value: newTask, }, });
    expect(
      lugiax
        .getState()
        .get('todo')
        .get('formData')
        .get('task')
    ).toEqual(newTask);
    input.simulate('keydown', { keyCode: 13, });
    expect(
      lugiax
        .getState()
        .get('todo')
        .get('tasks')
        .toJS()
    ).toEqual(['hello', newTask,]);
  });

  function goUrl(url: string) {
    lugiax.getStore().dispatch(push(url));
  }
});
