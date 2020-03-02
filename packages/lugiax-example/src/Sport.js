import React from 'react';

/**
 *
 * create by ligx
 *
 * @flow
 */
const createPage = (id, text = id) => () => {
  console.info('render', id);
  return <h1 id={`${id}Res`}>{text}</h1>;
};
export default createPage('Sport');
