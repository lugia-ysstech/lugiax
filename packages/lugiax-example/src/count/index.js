/**
 *
 * create by ligx
 *
 * @flow
 */

import React, { useState } from "react";

export default () => {
  const [count, updateCount] = useState(0);
  return [
    <div>计数值：{count}</div>,
    <button onClick={() => updateCount(count + 1)}> 增加</button>,
    <button onClick={() => updateCount(count - 1)}> 减少</button>
  ];
};
