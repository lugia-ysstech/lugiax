/**
 *
 * create by ligx
 *
 * @flow
 */
import type { RegisterResult, } from '@lugia/lugiax-core';
import lugiax from '@lugia/lugiax-core';

import * as React from 'react';
import { getDisplayName, } from './utils';
import hoistStatics from 'hoist-non-react-statics';

export default function(
  modelData: RegisterResult,
  mapValue: (state: Object) => { [valueName: string]: any },
  trigger: {
    [eventName: string]: (mutations: Object, ...args: any) => any
  } = {}
) {
  const { model, mutations, } = modelData;
  trigger = trigger ? trigger : {};

  return (Target: React.ComponentType<any>) => {
    const widgetName = getDisplayName(Target);

    class Component extends React.Component<any, any> {
      static displayName = `lugiax-bind-${widgetName}`;
      unSubscribe: Function;
      eventHandler: Object;

      constructor(props: any) {
        super(props);
        this.state = { version: 0, };
        const { unSubscribe, } = lugiax.subscribe(model, () => {
          this.setState({ version: this.state.version + 1, });
        });
        this.unSubscribe = unSubscribe;
        this.eventHandler = {};
        Object.keys(trigger).forEach((key: string) => {
          const func = trigger[key];
          this.eventHandler[key] = (...rest) => {
            func.call(null, modelData.mutations, ...rest);
          };
        });
      }

      static getDerivedStateFromProps() {
        return mapValue(lugiax.getState().get(model));
      }

      render() {
        return (
          <Target {...this.props} {...this.state} {...this.eventHandler} />
        );
      }

      componentWillUnmount() {
        this.unSubscribe();
        delete this.unSubscribe;
      }
    }

    return hoistStatics(Component, Target);
  };
}
