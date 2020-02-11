/**
 *
 * create by ligx
 *
 * @flow
 */
import React from "react";
import InputTask from "./components/InputTask";
import List from "./components/List";
import { bindTo, connect } from "@lugia/lugiax";
import todo from "./models/todo";

const TodoList = connect(
  todo,
  state => {
    console.info("state", state);
    return { data: state.get("tasks") };
  },
  mutations => {
    console.info("mutations", mutations);
    const todo = mutations;
    return { delItem: todo.delTask };
  }
)(List);

const fieldPath = ["formData", "task"];
const fieldName = fieldPath.join(".");

const TodoInput = bindTo(
  todo,
  {
    [fieldName]: ["value", "label"]
  },
  {
    onChange: {
      [fieldName](v) {
        const split = v.split("-");
        return "hello-" + (split[1] || split[0]);
      }
    }
  },
  {
    onEnter() {
      todo.mutations.addTask();
    }
  }
)(InputTask);

export default () => {
  return (
    <div>
      <TodoInput />
      <TodoList />
    </div>
  );
};
