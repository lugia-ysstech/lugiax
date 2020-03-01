import { LugiaxType, } from '@lugia/lugiax-core';

/**
 * Created by liguoxin on 2017/3/14.
 * @flow
 */

declare module '@lugia/lugiax-data' {
  declare type ArrayOperator = 'push' | 'pop' | 'shift' | 'unshift' | 'splice' | 'sort' | 'reverse';
  declare type OperatorType = ArrayOperator;
  declare type ChangeType = 'change' | 'delete';
  /**
   *  抛出value如果是对象会进行浅克隆处理，并且删除$delete $set的操作
   */
  declare type OnChangeParam = {
    path: string[],
    value: ?any, // operator存在时则无value
    type: ChangeType,
    params: ?(any[]), // operator存在是才有操作的参数
    operator: ?OperatorType,
  };
  declare type LugiaxDataParam = {
    model: string,
    state: Object,
  };
  declare type LugiaxDataResult = {
    model: Object,
    data: Object,
    unSubscribe: () => void,
  };
  declare export interface LugiaxDataType {
    createData(param: LugiaxDataParam): LugiaxDataResult;
  }
  declare module.exports: LugiaxDataType;
}
