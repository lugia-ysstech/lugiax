/**
 *
 * create by ligx
 *
 * @flow
 */

export function getInputValue(component: any): any {
  const target = getInputDomNode(component);
  if (target) {
    return target.value;
  }
  return '';
}

export function getInputDomNode(component: any): HTMLInputElement | null {
  const result = component.getDOMNode();
  if (result instanceof HTMLInputElement) {
    return result;
  }
  return null;
}
