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
    /**
     * 根据model名称订阅相关模型数据变化消息
     * @param modelName
     * @param () => any
     */
    subscribe(modelName: string, () => any): void,
    clear(): void,
    All: string
  };

  declare module.exports: Lugiax;
}
