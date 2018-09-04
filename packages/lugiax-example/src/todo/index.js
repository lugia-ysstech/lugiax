/**
 *
 * create by ligx
 *
 * @flow
 */
import React, { Component, } from 'react';
import InputTask from './components/InputTask';
import List from './components/List';
import styled from 'styled-components';
import { bindTo, connect, } from '@lugia/lugiax';
import todo from './models/todo';

const Container = styled.div`
  margin: 50px;
`;
const TodoList = connect(
  todo,
  state => {
    return { data: state.todo.get('tasks'), };
  }
)(List);

const fieldPath = ['formData', 'task',];
const fieldName = fieldPath.join('.');

const TodoInput = bindTo(
  todo,
  {
    [fieldName]: 'value',
  },
  {
    onChange: {
      [fieldName](v) {
        return v;
      },
    },
  },
  {
    onEnter() {
      console.info(todo.mutations);
      todo.mutations.addTask();
      todo.mutations.cleanTaksInput();
    },
  }
)(InputTask);

export default () => {
  return (
    <Container>
      <TodoInput />
      <TodoList />
    </Container>
  );
};
