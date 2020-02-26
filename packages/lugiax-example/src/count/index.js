/**
 *
 * create by ligx
 *
 * @flow
 */

import React, { useState, } from 'react';
import { Button, } from '@lugia/lugia-web';

export default () => {
  const [count, updateCount,] = useState(0);
  return [
    <div>计数值：{count}</div>,
    <Button onClick={() => updateCount(count + 1)}> 增加</Button>,
    <Button onClick={() => updateCount(count - 1)}> 减少</Button>,
  ];
};
