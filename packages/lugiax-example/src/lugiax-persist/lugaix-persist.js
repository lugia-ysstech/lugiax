import lugaix from '@lugia/lugiax';
lugaix.registerGetPersistDataFn(name => {
  console.log('name====>', name);
  return JSON.parse(window.sessionStorage.getItem(name));
});

lugaix.registerSavePersistDataFn((name, data) => {
  console.log(name, data.toJS());
  window.sessionStorage.setItem(name, JSON.stringify(data.toJS()));
});
