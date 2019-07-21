/**
 *
 * create by ligx
 *
 * @flow
 */
import * as React from 'react';
import go from './go';

export default function Link(props: Object) {
  return (
    <a onClick={() => go({ url: props.to, })} href="javascript:void(0)">
      {' '}
      {props.children}
    </a>
  );
}
