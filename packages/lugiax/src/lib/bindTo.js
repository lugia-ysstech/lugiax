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
const defaultBindProps = 'value';

export default function(
  modelData: RegisterResult,
  bindConfig: string | { [key: string]: string },
  opt: { getValue?: Function } = {}
) {
  const { addMutation, } = modelData;
  let fieldNames = [];
  let props = [];
  const allAutoMutationName = [];

  let bindField: { [key: string]: string } = {};

  if (typeof bindConfig === 'string') {
    bindField = { [defaultBindProps]: bindConfig, };
  } else {
    bindField = bindConfig;
  }

  if (bindField) {
    props = Object.keys(bindField);
    fieldNames = props.map((key: string) => bindField[key]);
  }
  fieldNames.forEach((fieldName: string) => {
    const autoMutationName = `_lugiax_change${fieldName}`;
    allAutoMutationName.push(autoMutationName);
    addMutation(autoMutationName, (data: Object, inParam: Object) => {
      return data.set(fieldName, inParam[valueAttr]);
    });
  });

  const { getValue = e => e.target.value, } = opt;

  const modelMap = model => {
    const result = {};
    props.forEach((props: string) => {
      result[props] = model.get(bindField[props]);
    });
    return result;
  };

  return (Target: React.ComponentType<any>) => {
    return bind(modelData, modelMap, {
      onChange: (mutations, e) => {
        allAutoMutationName.forEach((autoMutationName: string) => {
          mutations[autoMutationName]({ [valueAttr]: getValue(e), });
        });
      },
    })(Target);
  };
}
