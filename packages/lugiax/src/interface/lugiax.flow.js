/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */

declare module '@lugia/lugiax' {
  declare interface Lugiax {
    connect(): any;
  }

  declare module.exports: Lugiax;
}
