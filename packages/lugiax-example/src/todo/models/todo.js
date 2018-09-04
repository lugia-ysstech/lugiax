/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';

const model = 'todo';
const state = {
  formData: {
    task: '',
  },
  tasks: ['hello',],
};
export default lugiax.register({
  model,
  state,
  mutations: {
    sync: {
      addTask(state, inParam, { mutations, }) {
        let tasks = state.get('tasks');
        tasks = tasks.push(state.getIn(['formData', 'task',]));
        const res = state.set('tasks', tasks);
        return res;
      },
      cleanTaksInput(state) {
        return state.setIn(['formData', 'task',], '');
      },
    },
  },
});
