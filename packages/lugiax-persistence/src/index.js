/**
 *
 * create by ligx
 *
 * @flow
 */
import type { Persistence, PersistenceOption, RegisterParam, } from '@lugia/lugiax-persistence';

let name2Persistence: { [name: string]: Persistence } = {};

const Default = 'default';


export function registerPersistence(persistDataFn: Persistence, name: string = Default) {
  name2Persistence[name] = persistDataFn;
}

export function clearPersistence() {
  name2Persistence = {};
}

export function unRegisterPersistence(name: string) {
  delete name2Persistence[name];
}

export default function(param: RegisterParam, option: PersistenceOption = {name: 'default',}): RegisterParam {
  const {name = 'default',} = option;
  if(name === 'default' && !name2Persistence[name]){
    initLocalStore();
  }
  return {};
}

const LugiaxPersistence = '__lugiax__persistence__';

 function initLocalStore(){

  registerPersistence({
    saveStore (model, state) {
      const local = getLocal();
      local[model] =  state;
    },
    getStore (model) {
      const local = getLocal();
      return local[model];
    },
  });
}
function getLocal (): Object {

  let local = window.localStorage[LugiaxPersistence];
  if(!local){
    local = window.localStorage[LugiaxPersistence] = {};
  }

  return local;
}
