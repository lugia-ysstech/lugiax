/**
 *
 * create by ligx
 *
 * @flow
 */
import React, { Component, } from 'react';

const hoverColor = 'red';

export default class List extends Component<any> {
  render() {
    return <ul>{this.renderList()}</ul>;
  }

  delItem = (title: string) => () => {
    const { delItem, } = this.props;
    delItem && delItem({ title, });
  };

  renderList(): Object[] {
    const { data = [], } = this.props;
    return data.map(
      (title: string): any => {
        const del = this.delItem(title);
        return (
          <span onClick={del}>
            {title} <span onClick={del}>x</span>
          </span>
        );
      }
    );
  }
}
