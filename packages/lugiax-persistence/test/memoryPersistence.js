let currentMemory: { [name: string]: Object } = {};
let memoryArray: Object[] = [];

export const setItem = (name, state) => {
  memoryArray.push(state);
  currentMemory[name] = state;
};

export const getItem = name => {
  return currentMemory[name];
};

export const getMemoryArray = () => {
  return memoryArray;
};

export const clearMemory = () => {
  currentMemory = {};
  memoryArray = [];
};
