import lugiax from '@lugia/lugiax-core';

/**
 *
 * create by ligx
 *
 * @flow
 */

export function getInputValue(component: any): any {
  const target = getInputDomNode(component);
  if (target) {
    return target.value;
  }
  return '';
}

export function getInputDomNode(component: any): HTMLInputElement | null {
  const result = component.getDOMNode();
  if (result instanceof HTMLInputElement) {
    return result;
  }
  return null;
}

export function createUserModel(name, pwd) {
  const model = 'user';

  const state = {
    name,
    pwd,
  };
  return lugiax.register({
    model,
    state,
    mutations: {
      sync: {
        changeName(data: Object, inParam: Object) {
          return data.set('name', inParam.name);
        },
      },
      async: {
        async changePwd(data: Object, inParam: Object) {
          return data.set('pwd', inParam.pwd);
        },
      },
    },
  });
}
