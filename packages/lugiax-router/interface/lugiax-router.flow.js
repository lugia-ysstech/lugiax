/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */
import type { RegisterResult, } from '@lugia/lugiax-core';
import React from 'react';

declare module '@lugia/lugiax-router' {
  declare type RouterConfig = {
    render?: Function,
    exact?: boolean,
    strict?: boolean,
    component?: Function,
    onPageLoad?: Function,
    onPageUnLoad?: ?Function,
  };

  declare type RouterMap = {
    [path: string]: RouterConfig,
  };
  declare type BeforeParam = {
    url: string,
  };

  declare type LoadingProps = {
    color: string,
  };
  declare type CreateAppParam = {
    loading?: React.Component<any>,
    loadingProps: LoadingProps,
    onBeforeGo?: (param: BeforeParam) => Promise<boolean>,
  };
}
