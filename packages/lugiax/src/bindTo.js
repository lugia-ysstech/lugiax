/**
 *
 * create by ligx
 *
 * @flow
 */
import type { Mutation, RegisterResult, } from '@lugia/lugiax-core';
import type { BindConfig, EventHandle, EventMuationConfig, Field2Props, } from '@lugia/lugiax';

import * as React from 'react';
import bind from './bind';

const valueAttr = 'value';
const defaultBindProps = 'value';
const CntName = '_lugiax_event_cnt';
const DefaultEvent = 'onChange';

export function gettor(model: Object, pathStr: string): Function {
  return () => {
    return model.getIn(getPathArray(pathStr));
  };
}

export function settor(model: Object, pathStr: string): Function {
  return (value: any) => {
    return model.setIn(getPathArray(pathStr), value);
  };
}

export function getPathArray(pathStr: ?string = ''): string[] {
  const path = pathStr.split('.');

  const res = [];

  path.forEach((str: string) => {
    const craftIndex = str.indexOf('[');
    if (~craftIndex) {
      const attr = str.substr(0, craftIndex);
      res.push(attr);
      const otherStr = str.substr(craftIndex);
      res.push(otherStr.substr(1, otherStr.length - 2));
    } else {
      res.push(str);
    }
  });
  return res;
}

export default function(
  modelData: RegisterResult,
  bindConfig: BindConfig,
  eventConfig: EventMuationConfig = {},
  opt: ?ConnectOptionType = {}
) {
  const field2Props = getFieldProps(bindConfig);
  const fieldNames = getFieldNames(field2Props);
  
  const field2AutoMutationName = generateAutoMutations(modelData, fieldNames);

  const eventHandle = {};
  const isNotDefaultEvent = key => key !== DefaultEvent;

  Object.keys(Object.assign({ [DefaultEvent]: true, }, eventConfig)).forEach((eventName: string) => {
    eventHandle[eventName] = (mutations, ...args) => {
      fieldNames
        .filter(field => {
          return (
            isNotDefaultEvent(eventName) || defaultOnChangeEvent(eventConfig, fieldNames)(field)
          );
        })
        .forEach(
          triggerMutations(mutations, field2AutoMutationName, eventConfig, eventName, ...args)
        );
    };
  });
  const areStateEqual = autoCreateAreStateEqual(fieldNames);
  return (Target: React.ComponentType<any>) => {
    return bind(modelData, generateMode2Props(fieldNames, field2Props), eventHandle, {
      areStateEqual,
      ...opt,
    })(Target);
  };
}

function autoCreateAreStateEqual(fieldNames: string[]) {
  return (oldModel, newModel) => {
    return !fieldNames.every(fieldName => {
      const oldGetValue = gettor(oldModel, fieldName)();
      const newGetValue = gettor(newModel, fieldName)();
      return oldGetValue == newGetValue;
    });
  };
}

function defaultOnChangeEvent(eventConfig: EventMuationConfig, fieldNames: string[]) {
  const field2Event = getField2Event(eventConfig, fieldNames);

  return (field: string) => {
    const fieldEventConfig = field2Event[field];
    return !fieldEventConfig || fieldEventConfig[CntName] === 0 || fieldEventConfig[DefaultEvent];
  };
}

function triggerMutations(
  mutations: Mutation,
  field2AutoMutationName: Object,
  eventConfig: EventMuationConfig,
  eventName: string,
  ...args
) {
  return (field: string) => {
    const autoMutationName = field2AutoMutationName[field];
    const valueMethod = getValueMethod(eventConfig, eventName, field);
    mutations[autoMutationName]({ [valueAttr]: valueMethod(...args), });
  };
}

function getField2Event(eventConfig: EventMuationConfig, fieldNames: string[]) {
  const res = {};

  if (!eventConfig) {
    return res;
  }

  Object.keys(eventConfig).forEach((eventName: string) => {
    const cfg = eventConfig[eventName];
    fieldNames.forEach(field => {
      let fieldEvent = res[field];
      if (!fieldEvent) {
        fieldEvent = res[field] = {
          [CntName]: 0,
        };
      }
      const handle = cfg[field];
      if (handle) {
        fieldEvent[CntName]++;
        fieldEvent[eventName] = handle;
      }
    });
  });
  return res;
}

const getOnChangeValue = e => e.target.value;

function getValueMethod(eventConfig: EventMuationConfig, eventName: string, fieldName: string) {
  if (!eventConfig || !eventConfig[eventName] || !eventConfig[eventName][fieldName]) {
    return getOnChangeValue;
  }
  const targetEventConfig = eventConfig[eventName];
  if (!targetEventConfig) {
    return getOnChangeValue;
  }
  const fieldEventConfig = targetEventConfig[fieldName];
  return fieldEventConfig ? fieldEventConfig : getOnChangeValue;
}

function getFieldNames(field2Props: Field2Props): string[] {
  return field2Props ? Object.keys(field2Props) : [];
}

function getFieldProps(bindConfig: BindConfig) {
  let field2Props: Field2Props = {};

  if (typeof bindConfig === 'string') {
    field2Props = { [bindConfig]: defaultBindProps, };
  } else {
    field2Props = bindConfig;
  }
  return field2Props;
}

function generateMode2Props(fieldNames: string[], field2Props: Field2Props): Function {
  return model => {
    const result = {};
    fieldNames.forEach((field: string) => {
      const get = gettor(model, field);
      const field2Prop = field2Props[field];
      if (Array.isArray(field2Prop)) {
        field2Prop.forEach(prop => {
          result[prop] = get();
        });
      } else {
        result[field2Prop] = get();
      }
    });
    return result;
  };
}

function generateAutoMutations(modelData: RegisterResult, fieldNames: string[]) {
  const field2AutoMutationName = {};
  let { addMutation, } = modelData;
  const { mutations, addDataMutation, } = modelData;
  addMutation = addDataMutation || addMutation;
  fieldNames.forEach((fieldName: string) => {
    const autoMutationName = `_alugiax_change${fieldName}`;
    field2AutoMutationName[fieldName] = autoMutationName;
    if (!mutations[autoMutationName]) {
      addMutation(autoMutationName, (data: Object, inParam: Object) => {
        const newValue = inParam[valueAttr];
        const { __cb2Data__, } = inParam;
        if (__cb2Data__) {
          __cb2Data__({ path: fieldName, newValue, });
        }
        const set = settor(data, fieldName);
        return set(newValue);
      });
    }
  });
  return field2AutoMutationName;
}
