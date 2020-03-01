/**
 *
 * create by ligx
 *
 * @flow
 */
import type { OnChangeParam, } from '@lugia/lugiax-data';

import isPlainObject from 'is-plain-object';
import { Subscribe, } from '@lugia/lugiax-common';

export const Change = 'change';
export const Delete = 'delete';

const arrayFunctionNames = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse',];

type OnChange = (param: OnChangeParam) => void;

function defineArray(target: Object, path: string[], trigger: OnChange) {
  arrayFunctionNames.forEach((name: string) => {
    Object.defineProperty(target, name, {
      get() {
        return (...rest) => {
          let result = Array.prototype[name].call(target, ...rest);
          if(name === 'pop' || name === 'shift'|| name === 'splice'){
            result = clone(result);
          }
          if (name === 'push') {
            const lastIndex = target.length - 1;
            const pushItem = target[lastIndex];
            if (isPlainObject(pushItem)) {
              defineAllKeysProperty(pushItem, [...path, lastIndex,], trigger);
            }
            if (Array.isArray(pushItem)) {
              defineOneProperty(target, lastIndex, path, trigger);
            }
          }
          if (name === 'shift' || name === 'unshift' || name === 'sort' || name === 'reverse' || name === 'splice') {
              for (let i = 0; i < target.length; i++) {
                const item = target[i];
                if (isPlainObject(item)) {
                  defineAllKeysProperty(item, [...path, i,], trigger);
                }
              }
          }
          trigger({
            path,
            type: Change,
            params: rest ? rest.map(item => clone(item)) : rest,
            isArray: true,
            operator: name,
          });
          return result;
        };
      },
    });
  });
}

function defineDelete(state: Object, fatherPath: string[] = [], trigger: OnChange): void {
  Object.defineProperty(state, '$delete', {
    configurable: true,
    get() {
      return (attribute: string) => {
        const isArray = Array.isArray(state);
        if (isArray && typeof attribute === 'number') {
          state.splice(attribute, 1);
        } else {
          delete state[attribute];
          trigger({
            type: Delete,
            isArray,
            value: String(attribute),
            path: fatherPath,
          });
        }
      };
    },
  });
}

function defineSet(state: Object, fatherPath: string[] = [], trigger: OnChange): void {
  Object.defineProperty(state, '$set', {
    configurable: true,
    get() {
      return (attribute: string, value: any) => {
        const isEmptyAttribute = attribute === null || attribute === undefined;
        const isNumberAttribute = typeof attribute === 'number';
        const stateIsPlainObject = isPlainObject(state);

        if (isEmptyAttribute || (stateIsPlainObject && isNumberAttribute)) {
          attribute = String(attribute);
        }
        const attributeInStateBeforeUpdate = attribute in state;

        state[attribute] = value;
        const path = [...fatherPath, attribute,];
        if (Array.isArray(value)) {
          for (let i = 0; i < value.length; i++) {
            const item = value[i];
            if (isPlainObject(item)) {
              defineAllKeysProperty(item, [...path, i,], trigger);
            }
          }
        }
        defineOneProperty(state, attribute, fatherPath, trigger);

        const isArray = Array.isArray(state);
        const needTrigger = !attributeInStateBeforeUpdate || isArray || isNumberAttribute;
        if (needTrigger) {
          trigger({
            path,
            value: clone(value),
            isArray,
            type: Change,
          });
        }
      };
    },
  });
}

function defineAllKeysProperty(state: Object, fatherPath: string[] = [], trigger: OnChange): void {
  defineSet(state, fatherPath, trigger);
  defineDelete(state, fatherPath, trigger);
  Object.keys(state).forEach((attribute: string) => {
    defineOneProperty(state, attribute, fatherPath, trigger);
  });
}

function defineOneProperty(
  state: Object,
  attribute: string,
  fatherPath: string[] = [],
  trigger: onChange
): void {
  const stateIsArray = Array.isArray(state);
  if (!isPlainObject(state) && !stateIsArray) {
    return;
  }
  let value = state[attribute];
  const targetPath = [...fatherPath, attribute,];
  if (isPlainObject(value)) {
    defineAllKeysProperty(value, targetPath, trigger);
  } else {
    if (Array.isArray(value)) {
      defineSet(value, targetPath, trigger);
      defineDelete(value, targetPath, trigger);
      defineArray(value, targetPath, trigger);
    }
  }

  Object.defineProperty(state, attribute, {
    get() {
      return value;
    },
    set(newValue: any) {
      value = newValue;
      trigger({
        path: targetPath,
        value: clone(newValue),
        type: Change,
        isArray: stateIsArray,
      });
    },
  });
}

function clone(target) {
  if (isPlainObject(target) || Array.isArray(target)) {
    return JSON.parse(JSON.stringify(target));
  }
  return target;
}
export default function(state: Object => void) {
  const subscribe = new Subscribe();
  return {
    state: createDataOnChange(state, (param: OnChangeParam) => {
      const { type, } = param;
      subscribe.trigger(type, param);
    }),
    subscribe: subscribe.subscribe.bind(subscribe),
  };
}

export function createDataOnChange(state: Object, onChange: OnChange) {
  defineAllKeysProperty(state, [], onChange);
  return state;
}
