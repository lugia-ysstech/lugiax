/**
 *
 * create by ligx
 *
 * @flow
 */
import { combineFunction, } from '@lugia/combine';
export function getDisplayName(Target: Object): string {
  return Target.displayName || Target.name || 'Component';
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
  const areStatePropsEqualVal =
    !areStatePropsEqual || areStatePropsEqual(comparativeData.preState, comparativeData.nextState);
  const areOwnPropsEqualVal =
    !areOwnPropsEqual || areOwnPropsEqual(comparativeData.preProps, comparativeData.nextProps);
  return areStatePropsEqualVal && areOwnPropsEqualVal;
}
export { combineFunction };
