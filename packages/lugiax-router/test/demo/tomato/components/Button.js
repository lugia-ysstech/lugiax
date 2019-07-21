/**
 *
 * create by ligx
 *
 * @flow
 */

import React, { Component, } from 'react';

export default class Button extends Component<any> {
  render() {
    const { data, } = this.props;
    return (
      <button onClick={this.props.onClick}>
        {this.props.doing ? data[1] : data[0]}
      </button>
    );
  }
}
