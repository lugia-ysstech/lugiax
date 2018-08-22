/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */
import type { RegisterResult, } from '@lugia/lugiax-core';

declare module '@lugia/lugiax' {
  declare interface Lugiax {
    connect(
      model: RegisterResult | Array<RegisterResult>,
      mapProps: (state: Object) => Object
    ): (target: Object) => any;
  }

  declare module.exports: Lugiax;
}
