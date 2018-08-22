/**
 *
 * create by ligx
 *
 * @flow
 */
export function getDisplayName(Target: Object): string {
  return Target.displayName || Target.name || 'Component';
}
