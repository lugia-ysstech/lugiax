/**
 *
 * create by ligx
 *
 * @flow
 */
export function getDisplayName(Target: Object): string {
  return Target.displayName || Target.name || "Component";
}

export function tillMethodAttribute(
  paramA: Object
): { [key: string]: Object[] } {
  const events = {};
  paramA &&
    Object.keys(paramA).reduce((pre, current) => {
      if (typeof paramA[current] === "function") {
        let config = pre[current];
        if (!config) {
          pre[current] = config = [];
        }
        config.push(paramA[current]);
      }
      return pre;
    }, events);
  return events;
}

export function combineMethodObject(...rest: Object[]): Object {
  const res = {};
  if (!rest) {
    return res;
  }

  const valuesObjects = rest.map(param => tillMethodAttribute(param));

  const keyObj = {};

  valuesObjects.forEach(obj => {
    Object.keys(obj).forEach(key => (keyObj[key] = true));
  });

  Object.keys(keyObj).forEach(key => {
    const values = [];
    valuesObjects.forEach(obj => {
      const value = obj[key];
      if (value) {
        Array.prototype.push.apply(values, value);
      }
    });
    res[key] = values;
  });
  return res;
}

export function combineFunction(...rest: Object[]): Object {
  const combineObj = combineMethodObject(...rest);
  const res = {};
  Object.keys(combineObj).forEach(key => {
    const method = combineObj[key];
    res[key] = (...rest) => {
      method && method.forEach(f => f(...rest));
    };
  });
  return res;
}

export function withRef(enable: boolean, self: Object): Object {
  const refConfig: Object = {};

  if (enable === true) {
    refConfig.ref = (cmp: any) => {
      self.target = cmp;
    };
  }
  return refConfig;
}

export function isShouldRender(
  areStatePropsEqual: function,
  areOwnPropsEqual: function,
  comparativeData: Object
): boolean {
  let areStatePropsEqualVal =
    !areStatePropsEqual ||
    areStatePropsEqual(comparativeData.preState, comparativeData.nextState);
  let areOwnPropsEqualVal =
    !areOwnPropsEqual ||
    areOwnPropsEqual(comparativeData.preProps, comparativeData.nextProps);
  return areStatePropsEqualVal && areOwnPropsEqualVal;
}
