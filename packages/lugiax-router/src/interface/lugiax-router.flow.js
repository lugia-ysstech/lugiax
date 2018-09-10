/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */
import type { RegisterResult, } from '@lugia/lugiax-core';

declare module '@lugia/lugiax-router' {
  declare type RouterConfig = {
    render?: Function,
    exact?: boolean,
    component?: ?Function
  };

  declare type RouterMap = {
    [path: string]: RouterConfig
  };
}
