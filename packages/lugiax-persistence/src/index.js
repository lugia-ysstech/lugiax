/**
 *
 * create by ligx
 *
 * @flow
 */
import type {
  Persistence,
  Mutations,
  PersistenceOption,
  RegisterParam,
} from '@lugia/lugiax-persistence';

let name2Persistence: { [name: string]: Persistence } = {};

const Default = 'default';

function persistenceIsRight(persistDataFn: Persistence) {
  return (
    persistDataFn &&
    Object.prototype.toString.call(persistDataFn) === '[object Object]' &&
    'getStore' in persistDataFn &&
    typeof persistDataFn.getStore === 'function' &&
    'saveStore' in persistDataFn &&
    typeof persistDataFn.getStore === 'function'
  );
}

export function registerPersistence(persistDataFn: Persistence, name: string = Default) {
  if (persistenceIsRight(persistDataFn)) {
    name2Persistence[name] = persistDataFn;
  } else {
    console.warn('persistenceIsRight方法传入的persistence参数没有包含getStore和saveStore方法');
  }
}

export function getPersistence(name: string) {
  return name2Persistence[name];
}

export function clearPersistence() {
  name2Persistence = {};
}

export function unRegisterPersistence(name: string) {
  delete name2Persistence[name];
}

export default function(
  param: RegisterParam,
  option: PersistenceOption = { name: 'default', }
): RegisterParam {
  const { name = 'default', } = option;
  if (name === 'default' || !name2Persistence[name]) {
    option.name = 'default';
    initLocalStore();
  }
  const { name: persistenceName, } = option;
  const persistController = name2Persistence[persistenceName];
  const { model: modelName, } = param;
  const persistData =
    persistController && persistController.getStore && persistController.getStore(modelName);
  if (persistData) {
    param.state = persistData;
  }
  const { async = {}, sync = {}, } = param.mutations || {};
  const newAsyncFn = generatePersistMutation(async, true, modelName, persistController);
  const newSyncFn = generatePersistMutation(sync, false, modelName, persistController);
  param.mutations = { async: newAsyncFn, sync: newSyncFn, };
  return { ...param, };
}

function initLocalStore() {
  registerPersistence({
    saveStore(model, state) {
      saveDataInLocalStorage(model, state);
    },
    getStore(model) {
      return getDataByLocalStorage(model);
    },
  });
}

function generatePersistMutation(
  mutations: Mutations,
  isAsync: Boolean,
  modelName: string,
  persistController: Persistence
) {
  const result = {};
  Object.keys(mutations).forEach(key => {
    const newMutation = isAsync
      ? async (...param: Object) => {
          const mutationData = await mutations[key](...param);
          persistController &&
            persistController.saveStore &&
            persistController.saveStore(modelName, mutationData);
          return mutationData;
        }
      : (...param: Object) => {
          const mutationData = mutations[key](...param);
          persistController &&
            persistController.saveStore &&
            persistController.saveStore(modelName, mutationData);
          return mutationData;
        };
    result[key] = newMutation;
  });
  return result;
}

const LugiaxPersistence = '__lugiax__persistence__';

function getDataByLocalStorage(model: string): Object {
  let persistData = objectStringToJson(window.localStorage.getItem(LugiaxPersistence));
  if (!persistData) {
    persistData = {};
  }
  return persistData[model];
}

function saveDataInLocalStorage(model: string, state: object): Boolean {
  try {
    const persistData = objectStringToJson(window.localStorage.getItem(LugiaxPersistence)) || {};
    persistData[model] = state.toJS() || {};
    window.localStorage.setItem(LugiaxPersistence, JSON.stringify(persistData));
    return true;
  } catch (ex) {
    console.warn('持久化数据保存失败！', ex.message);
    return false;
  }
}

function objectStringToJson(str: string) {
  try {
    return JSON.parse(str);
  } catch (ex) {
    console.warn('持久化的JSON字符串转为成对象时报错，请核实数据！', ex.message);
    return {};
  }
}
