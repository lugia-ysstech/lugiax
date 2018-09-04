/**
 *
 * create by ligx
 *
 * @flow
 */
import React, { Component, } from 'react';

export default class List extends Component {
  render() {
    return <ul>{this.renderList()}</ul>;
  }

  renderList() {
    const { data = [], } = this.props;
    return data.map(title => {
      return <li>{title}</li>;
    });
  }
}
