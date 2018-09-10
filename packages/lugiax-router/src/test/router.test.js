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
import { createApp, Link, } from '../lib';
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
    checkUrl('/');
  });

  it('url change', async () => {
    const targetUrl = '/todo';
    goUrl(targetUrl);
    checkUrl(targetUrl);
  });

  it('async url change', async () => {
    const targetUrl = '/tomato/history';
    goAndCheckUrl(targetUrl);

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
    goAndCheckUrl(targetUrl);
    const newTask = 'new Task';
    const input = cmp.find('input');
    expect(input.length).toBe(1);
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

  it('link', async () => {
    const targetUrl = '/tomato';
    goAndCheckUrl(targetUrl);

    const links = cmp.find(Link).find('a');
    const todoLink = links.at(1);
    todoLink.simulate('click', {});
    cmp.update();
    checkUrl('/todo');
    const input = cmp.find('input');
    expect(input.length).toBe(1);
  });

  it('go', async () => {
    const targetUrl = '/tomato';
    goAndCheckUrl(targetUrl);
    const btn = cmp.find('button');
    const todoLink = btn.at(0);
    todoLink.simulate('click', {});
    cmp.update();
    checkUrl('/todo');
  });

  it('add tomato', async () => {
    const targetUrl = '/tomato/now';
    goAndCheckUrl(targetUrl);

    await new Promise(res => {
      setTimeout(() => {
        cmp.update();
        const newTask = 'newTask';
        const theName = cmp.find('input').at(0);
        theName.simulate('change', { target: { value: newTask, }, });
        const addBtn = cmp.find('button').at(1);
        addBtn.simulate('click', {});
        const { doing, time, error, beginAt, taskName, } = lugiax
          .getState()
          .get('tomato')
          .toJS();
        const recive = { doing, time, error, taskName, beginAt, };
        expect(recive).toEqual({
          doing: true,
          error: '',
          time: 0,
          taskName: newTask,
          beginAt: new Date().toString(),
        });
        addBtn.simulate('click', {});
        expect(
          lugiax
            .getState()
            .get('tomato')
            .toJS().tomotos
        ).toEqual([
          {
            time: 0,
            taskName: newTask,
            beginAt: new Date().toString(),
          },
        ]);
        res(true);
      }, 200);
    });
  });

  function goAndCheckUrl(targetUrl: string) {
    goUrl(targetUrl);
    cmp.update();
    checkUrl(targetUrl);
  }

  function goUrl(url: string) {
    lugiax.getStore().dispatch(push(url));
  }

  function checkUrl(url: string) {
    expect(
      lugiax
        .getState()
        .get('router')
        .get('location')
        .toJS().pathname
    ).toBe(url);
  }
});
