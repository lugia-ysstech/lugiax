import { registerPersistence, } from '@lugia/lugiax-persistence';

const domainName = 'my_data';

const objectStringToJson = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (ex) {
    console.warn('持久化的JSON字符串转为成对象时报错，请核实数据！', ex.message);
    return {};
  }
};
const getStateBySession = modelName => {
  let persistData = objectStringToJson(window.sessionStorage.getItem(domainName));
  if (!persistData) {
    persistData = {};
  }
  return persistData[modelName];
};

const saveStateBySession = (modelName, state) => {
  try {
    const persistData = objectStringToJson(window.sessionStorage.getItem(domainName)) || {};
    persistData[modelName] = state.toJS() || {};
    window.sessionStorage.setItem(domainName, JSON.stringify(persistData));
    return true;
  } catch (ex) {
    console.warn('持久化数据保存失败！', ex.message);
    return false;
  }
};

const Persistence = {
  getStore: getStateBySession,
  saveStore: saveStateBySession,
};

registerPersistence(Persistence, 'mySession');
