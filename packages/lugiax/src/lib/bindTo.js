/**
 *
 * create by ligx
 *
 * @flow
 */
import type { RegisterResult, } from '@lugia/lugiax-core';

import * as React from 'react';
import bind from './bind';

const valueAttr = 'value';

export default function(
  modelData: RegisterResult,
  fieldName: string,
  opt: { getValue?: Function, valueProps?: string, changeEvent?: string } = {}
) {
  const { addMutation, } = modelData;
  const autoMutationName = `_lugiax_change${fieldName}`;
  addMutation(autoMutationName, (data: Object, inParam: Object) => {
    return data.set(fieldName, inParam[valueAttr]);
  });
  const { getValue = e => e.target.value, } = opt;

  return (Target: React.ComponentType<any>) => {
    return bind(
      modelData,
      model => {
        console.info('model.get(valueAttr)', model.get(valueAttr));
        return model.get(fieldName);
      },
      (mutations, e) => {
        return mutations[autoMutationName]({ [valueAttr]: getValue(e), });
      },
      opt
    )(Target);
  };
}
