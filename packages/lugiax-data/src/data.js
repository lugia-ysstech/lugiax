/**
 *
 * create by ligx
 *
 * @flow
 */
import isPlainObject from 'is-plain-object';
import { Subscribe, } from '@lugia/lugiax-common';

export const Change = 'change';
export const Delete = 'delete';

const arrayFunctionNames = ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse',];

type ArrayOperator = 'push' | 'pop' | 'shift' | 'unshift' | 'splice' | 'sort' | 'reverse';
type OperatorType = ArrayOperator;
type ChangeType = Change | Delete;
/**
 *  抛出value如果是对象会进行浅克隆处理，并且删除$delete $set的操作
 */
type OnChangeParam = {
  path: string[],
  value: ?any, // operator存在时则无value
  type: ChangeType,
  params: ?(any[]), // operator存在是才有操作的参数
  operator: ?OperatorType,
};
type OnChange = (param: OnChangeParam) => void;

function defineArray(target: Object, path: string[], trigger: OnChange) {
  arrayFunctionNames.forEach((name: string) => {
    Object.defineProperty(target, name, {
      get() {
        return (...rest) => {
          const result = Array.prototype[name].call(target, ...rest);
          trigger({ path, type: Change, params: rest, isArray: true, operator: name, });
          return result;
        };
      },
    });
  });
}

function defineDelete(state: Object, fatherPath: string[] = [], trigger: OnChange): void {
  Object.defineProperty(state, '$delete', {
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
        defineOneProperty(state, attribute, fatherPath, trigger);

        const isArray = Array.isArray(state);
        const needTrigger = !attributeInStateBeforeUpdate || isArray || isNumberAttribute;
        if (needTrigger) {
          trigger({
            path: [...fatherPath, attribute,],
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
  if (typeof attribute === 'number') {
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
        isArray: Array.isArray(state),
      });
    },
  });
}

function clone(target) {
  if (isPlainObject(target)) {
    const result = { ...target, };
    deleteDataExtendAttribute(result);
    return result;
  } else if (Array.isArray(target)) {
    const result = [...target,];
    deleteDataExtendAttribute(result);
    return result;
  }

  return target;
}

function deleteDataExtendAttribute(target: Object) {
  delete target.$set;
  delete target.$delete;
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
