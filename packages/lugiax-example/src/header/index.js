/**
 *
 * create by ligx
 *
 * @flow
 */
import React from "react";
import { go, Link } from "@lugia/lugiax-router";

export default class Header extends React.Component<any> {
  render() {
    return (
      <div>
        <button onClick={this.onClick}>gotodo</button>

        <div>
          <Link to="/tomato">番茄钟</Link>
          &nbsp;
          <Link to="/todo">todo</Link>
          <Link to="/from">from</Link>
          <Link to="/nowPower">nowPower</Link>
          <Link to="/count">count</Link>
        </div>
      </div>
    );
  }

  onClick = () => {
    go({ url: "/todo" });
  };
}
