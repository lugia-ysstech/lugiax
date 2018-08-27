/**
 *
 * create by ligx
 *
 * @flow
 */
import type { Mutation, RegisterResult, } from '@lugia/lugiax-core';
import type { BindConfig, EventConfig, Field2Props, } from '@lugia/lugiax';

import * as React from 'react';
import bind from './bind';

const valueAttr = 'value';
const defaultBindProps = 'value';
const CntName = '_lugiax_event_cnt';
const DefaultEvent = 'onChange';

export default function(
  modelData: RegisterResult,
  bindConfig: BindConfig,
  eventConfig: EventConfig = {}
) {
  const field2Props = getFieldProps(bindConfig);
  const fieldNames = getFieldNames(field2Props);

  const field2AutoMutationName = generateAutoMutations(modelData, fieldNames);
  const field2Event = getField2Event(eventConfig, fieldNames);

  const eventHandle = {
    [DefaultEvent]: (mutations, ...args) => {
      fieldNames
        .filter(defaultOnChangeEvent(field2Event))
        .forEach(
          triggerMutations(
            mutations,
            field2AutoMutationName,
            eventConfig,
            DefaultEvent,
            ...args
          )
        );
    },
  };
  const isNotDefaultEvent = key => key !== DefaultEvent;

  Object.keys(eventConfig)
    .filter(isNotDefaultEvent)
    .forEach((eventName: string) => {
      eventHandle[eventName] = (mutations, ...args) => {
        fieldNames.forEach(
          triggerMutations(
            mutations,
            field2AutoMutationName,
            eventConfig,
            eventName,
            ...args
          )
        );
      };
    });
  console.info('eventHandle', eventHandle);

  return (Target: React.ComponentType<any>) => {
    return bind(
      modelData,
      generateMode2Props(fieldNames, field2Props),
      eventHandle
    )(Target);
  };
}

function defaultOnChangeEvent(field2Event: Object) {
  return (field: string) => {
    const fieldEventConfig = field2Event[field];
    return (
      !fieldEventConfig ||
      fieldEventConfig[CntName] === 0 ||
      fieldEventConfig[DefaultEvent]
    );
  };
}

function triggerMutations(
  mutations: Mutation,
  field2AutoMutationName: Object,
  eventConfig: EventConfig,
  eventName: string,
  ...args
) {
  return (field: string) => {
    const autoMutationName = field2AutoMutationName[field];
    const valueMethod = getValueMethod(eventConfig, eventName, field);
    mutations[autoMutationName]({ [valueAttr]: valueMethod(...args), });
  };
}

function getField2Event(eventConfig: EventConfig, fieldNames: string[]) {
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

function getValueMethod(
  eventConfig: EventConfig,
  eventName: string,
  fieldName: string
) {
  if (
    !eventConfig ||
    !eventConfig[eventName] ||
    !eventConfig[eventName][fieldName]
  ) {
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

function generateMode2Props(
  fieldNames: string[],
  field2Props: Field2Props
): Function {
  return model => {
    const result = {};
    fieldNames.forEach((field: string) => {
      result[field2Props[field]] = model.get(field);
    });
    return result;
  };
}

function generateAutoMutations(
  modelData: RegisterResult,
  fieldNames: string[]
) {
  const field2AutoMutationName = {};
  const { addMutation, } = modelData;
  fieldNames.forEach((fieldName: string) => {
    const autoMutationName = `_lugiax_change${fieldName}`;
    field2AutoMutationName[fieldName] = autoMutationName;
    addMutation(autoMutationName, (data: Object, inParam: Object) => {
      return data.set(fieldName, inParam[valueAttr]);
    });
  });
  return field2AutoMutationName;
}
