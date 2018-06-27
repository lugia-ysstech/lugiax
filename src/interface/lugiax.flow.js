/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */

declare module '@lugia/lugiax' {
  declare type ActionParam = { [key: string]: () => Promise<any> };

  declare type Action = {
    [key: string]: { name: string }
  };

  declare type RegisterParam = {
    model: string,
    state: Object,
    verify?: Function,
    action?: ActionParam
  };
  declare type Option = {
    force: boolean // 是否强制注册 默认为false
  };

  declare type Lugiax = {
    register(param: RegisterParam, option?: Option): Action,
    dispatch(action: Action): void,
    getState(): Object,
    subscribe(() => any): void,
    clear(): void
  };

  declare module.exports: Lugiax;
}
