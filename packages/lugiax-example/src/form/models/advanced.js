/**
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';
import React from 'react';

const columns = [
  {
    title: '成员名字',
    dataIndex: 'name',
    key: 'name',
    width: 100,
  },
  {
    title: '工号',
    dataIndex: 'id',
    key: 'id',
    width: 100,
  },
  {
    title: '所属部门',
    dataIndex: 'address',
    key: 'address',
    width: 200,
  },
];

const tableData = [
  { name: 'Jack', id: 1, address: 'some where', },

  { name: 'Rose', id: 2, address: 'some where', },

  { name: 'Uzi', id: 3, address: 'some where', },
];

const model = 'advancedForm';
const state = {
  saveInfo: {},
  personnelList: [],
  tableTitle: [],
};
export default lugiax.register({
  model,
  state,
  mutations: {
    sync: {
      updateTable(state, inparam) {
        console.log('updateTable');
        return state.set('tableTitle', inparam);
      },
      updateList(state, inparam) {
        console.log('updateList');
        return state.set('personnelList', inparam);
      },
      onNameChange(state, inparam) {
        return state.setIn(['saveInfo', 'name',], inparam.newValue);
      },
      onIpAddressChange(state, inparam) {
        return state.setIn(['saveInfo', 'id',], inparam);
      },
      onManageChange(state, inparam) {
        return state.setIn(['saveInfo', 'address',], inparam.newValue);
      },
      addPersonnel(state, inparam, { mutations, }) {
        const list = state.get('personnelList');
        const info = state.get('saveInfo').toJS();
        list.push(info);
        mutations.updateList(list);
      },
      deletePersonnel(state, inparam, { mutations, }) {
        const list = state.get('personnelList');
        const newList = list.filter(item => {
          return item.id !== inparam;
        });
        mutations.updateList(newList);
      },
    },
    async: {
      async getList(state, inparam, { mutations, }) {
        const data = await new Promise((reslove, reject) => {
          setTimeout(() => {
            reslove({ tableTitle: columns, personnelList: tableData, });
          }, 1000);
        });
        mutations.updateTable(data.tableTitle);
        mutations.updateList(data.personnelList);
      },
    },
  },
});
