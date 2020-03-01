/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */

declare module '@lugia/lugiax-common' {
  declare type SubscribeResult = {
    unSubscribe: Function,
  };

  declare interface ISubscribe {
    clear(): void;
    trigger(topic: string, ...param: any): void;
    subscribe(topic: string, cb: Function): SubscribeResult;
  }
  declare module.exports: { Subscribe: ISubscribe };
}
