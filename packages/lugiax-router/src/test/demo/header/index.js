/**
 *
 * create by ligx
 *
 * @flow
 */
import React from 'react';
import { go, Link, } from '../../../lib';

export default class Header extends React.Component<any, any> {
  render() {
    return (
      <div>
        <buton onClick={this.onClick}>go</buton>
        <Link to="/tomato">番茄钟</Link>
        &nbsp;
        <Link to="/todo">todo</Link>
      </div>
    );
  }

  onClick = () => {
    go({ url: '/todo', });
  };
}
