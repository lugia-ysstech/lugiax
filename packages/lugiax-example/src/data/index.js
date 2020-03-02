/**
 *
 * create by ligx
 *
 * @flow
 */
import React from 'react';
import { bindTo, LugiaxData, } from '@lugia/lugiax';

const List = props => {
  return [<input value={props.text} onChange={props.onChange}></input>,];
};
const op = LugiaxData.createData({
  model: 'hello',
  state: {
    data: {
      text: 'ligx',
    },
  },
});

window.op = op;
const PreviewList = bindTo(op.model, { 'data.text': 'text', })(List);
export default () => {
  return <PreviewList />;
};
