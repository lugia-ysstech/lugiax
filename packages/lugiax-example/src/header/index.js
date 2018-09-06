/**
 *
 * create by ligx
 *
 * @flow
 */
import { Link, } from 'react-router-dom';
import React from 'react';

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    console.info('init header');
  }
  render() {
    return (
      <div>
        <Link to="/tomato">番茄钟</Link>
        &nbsp;
        <Link to="/todo">todo</Link>
      </div>
    );
  }
}
