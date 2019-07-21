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

export function createUserModel(name, pwd, age = 18) {
  const model = 'user';

  const state = {
    name,
    pwd,
    age,
  };
  return lugiax.register({
    model,
    state,
    mutations: {
      sync: {
        changeName(data: Object, inParam: Object) {
          return data.set('name', inParam.name);
        },
        changePwd(data: Object, inParam: Object) {
          return data.set('pwd', inParam.pwd);
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

export function createDeepUserModel(
  name,
  pwd,
  age = 18,
  phone: string[] = ['a', 'b',]
) {
  const model = 'user';

  const state = {
    form: {
      name,
      pwd,
      age,
      phone,
    },
  };
  return lugiax.register({
    model,
    state,
    mutations: {
      sync: {
        changeName(data: Object, inParam: Object) {
          const form = data.get('form');
          return data.set('form', form.set('name', inParam.name));
        },
        changePwd(data: Object, inParam: Object) {
          const form = data.get('form');
          return data.set('form', form.set('pwd', inParam.pwd));
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
