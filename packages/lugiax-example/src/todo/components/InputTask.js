/**
 *
 * create by ligx
 *
 * @flow
 */
import React, { Component, } from 'react';

export default class InputTask extends Component<any> {
  render() {
    return (
      <input
        onChange={this.onChange}
        onKeyDown={this.onKeyDown}
        value={this.props.value}
      />
    );
  }

  onChange = (e: any) => {
    const { onChange, } = this.props;
    onChange && onChange(e.target.value);
  };

  onKeyDown = (e: any) => {
    if (e.keyCode === 13) {
      const { onEnter, } = this.props;
      onEnter && onEnter();
    }
  };
}
