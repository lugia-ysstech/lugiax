/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from '@lugia/lugiax';
import todo from '../../todo/models/todo';
const { mutations: todoMutations, } = todo;

const model = 'tomato';
const state = {
  tomotos: [],
  doing: false,
  time: 0,
  beginAt: '',
  taskName: '',
};

async function delay(time: number, cb: Function) {
  return new Promise(res => {
    setInterval(() => {
      cb();
      res();
    }, time);
  });
}

export default lugiax.register({
  model,
  state,
  mutations: {
    sync: {
      stop(state: Object) {
        clearInterval(state.get('interval'));
        state = state.set('interval', -1);
        state = state.set('doing', false);
        let tomotos = state.get('tomotos');
        tomotos = tomotos.push({
          time: state.get('time'),
          beginAt: state.get('beginAt'),
          taskName: state.get('taskName'),
        });
        return state.set('tomotos', tomotos);
      },

      updateTime(state: Object) {
        return state.set('time', state.get('time') + 1);
      },
    },
    async: {
      async switch(state: Object, inParam: Object, { mutations, }) {
        const taskName = state.get('taskName');
        if (!taskName) {
          return state.set('error', '请填入任务名称');
        }
        state = !state.get('doing')
          ? await mutations.asyncStart()
          : mutations.stop();
        todoMutations.addTaskByTitle({ task: taskName, });
        return state.set('error', '');
      },

      async start(state: Object, inParam: Object, { mutations, }) {
        state = state.set('beginAt', new Date().toString());
        state = state.set('doing', true);
        await delay(1000, () => {});

        state = state.set(
          'interval',
          setInterval(() => {
            mutations.updateTime();
          }, 1000)
        );
        return state;
      },
    },
  },
});
