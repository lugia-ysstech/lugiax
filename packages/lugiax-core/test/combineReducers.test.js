/* eslint-disable max-nested-callbacks */

import Immutable from 'immutable';
import combineReducers from './../src/combineReducers';

describe('combineReducers()', () => {
  it('returns new state', () => {
    const rootReducer = combineReducers({
      foo: state => {
        return state.set('count', state.get('count') + 1);
      },
    });

    const initialState = Immutable.fromJS({
      foo: {
        count: 0,
      },
    });

    expect(rootReducer(initialState, { type: 'ADD', }).getIn(['foo', 'count',])).toEqual(1);
  });
  it('returns initial state from default values', () => {
    const initialState = Immutable.fromJS({
      outer: {
        inner: {
          bar: false,
          foo: true,
        },
      },
    });

    const innerDefaultState = Immutable.fromJS({
      bar: false,
      foo: true,
    });

    const rootReducer = combineReducers({
      outer: combineReducers({
        inner: (state = innerDefaultState) => {
          return state;
        },
      }),
    });

    // eslint-disable-next-line no-undefined
    expect(rootReducer(undefined, {})).toEqual(initialState);
  });
  it('returns initial state as instance of supplied Immutable.Record', () => {
    const defaultRecord = Immutable.Record({
      bar: {
        prop: 1,
      },
      foo: undefined, // eslint-disable-line no-undefined
    });
    const rootReducer = combineReducers(
      {
        bar: state => {
          return state;
        },
        foo: (state = { count: 0, }) => {
          return state;
        },
      },
      defaultRecord
    );

    const initialState = {
      bar: {
        prop: 1,
      },
      foo: {
        count: 0,
      },
    };

    // eslint-disable-next-line no-undefined
    const reducedState = rootReducer(undefined, {});

    expect(reducedState.toJS()).toEqual(initialState);
    expect(reducedState).toBeInstanceOf(defaultRecord);
  });
  it('returns initial state as instance of Immutable.OrderedMap', () => {
    const rootReducer = combineReducers(
      {
        bar: (state = { prop: 1, }) => {
          return state;
        },
        foo: (state = { count: 0, }) => {
          return state;
        },
      },
      Immutable.OrderedMap
    );

    const initialState = {
      bar: {
        prop: 1,
      },
      foo: {
        count: 0,
      },
    };

    // eslint-disable-next-line no-undefined
    const reducedState = rootReducer(undefined, {});

    expect(reducedState.toJS()).toEqual(initialState);
    expect(reducedState).toBeInstanceOf(Immutable.OrderedMap);
  });
  it('returns initial state as result of custom function call', () => {
    const getDefaultState = () => {
      return Immutable.Map({
        bar: {
          prop: 1,
        },
      });
    };
    const rootReducer = combineReducers(
      {
        bar: state => {
          return state;
        },
        foo: (state = { count: 0, }) => {
          return state;
        },
      },
      getDefaultState
    );

    const initialState = {
      bar: {
        prop: 1,
      },
      foo: {
        count: 0,
      },
    };

    // eslint-disable-next-line no-undefined
    const reducedState = rootReducer(undefined, {});

    expect(reducedState.toJS()).toEqual(initialState);
    expect(reducedState).toBeInstanceOf(Immutable.Map);
  });
});
