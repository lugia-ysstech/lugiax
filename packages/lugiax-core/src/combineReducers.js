import Immutable from 'immutable';

export default (reducers: Object, getDefaultState: ?Function = Immutable.Map): Function => {
  const reducerKeys = Object.keys(reducers);
  return (inputState: ?Function = getDefaultState(), action: Object): Immutable.Map => {
    return inputState.withMutations(temporaryState => {
      reducerKeys.forEach(reducerName => {
        const reducer = reducers[reducerName];
        const currentDomainState = temporaryState.get(reducerName);
        const nextDomainState = reducer(currentDomainState, action);

        temporaryState.set(reducerName, nextDomainState);
      });
    });
  };
};
