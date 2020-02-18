import React, { Component } from "react";
import { createRoute } from "@lugia/lugiax-router";
import "./App.css";
import Form from "./form";
import Header from "./header";
import Todo from "./todo";
import Count from "./count";
import Tomato from "./tomato";
import NotAccess from "./access/NotAccess";

export default () => {
  console.info("init main");
  console.info("Count", Count);

  return [
    <Header />,
    createRoute({
      "/todo": {
        exact: true,
        component: Todo
      },
      "/count": {
        exact: true,
        component: Count
      },
      "/from": {
        component: Form
      },
      "/tomato": {
        component: Tomato
      },
      "/403": {
        component: NotAccess,
        exact: true
      }
    })
  ];
};
