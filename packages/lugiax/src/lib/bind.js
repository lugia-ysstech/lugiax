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
  mapValue: (state: Object) => any,
  trigger: (mutations: Object, event: Object) => Function,
  opt: { valueProps?: string, changeEvent?: string } = {}
) {
  const { model, mutations, } = modelData;

  return (Target: React.ComponentType<any>) => {
    const widgetName = getDisplayName(Target);

    class Component extends React.Component<any, any> {
      static displayName = `lugiax-bind-${widgetName}`;
      unSubscribe: Function;

      constructor(props: any) {
        super(props);
        this.state = { version: 0, };
        const { unSubscribe, } = lugiax.subscribe(model, () => {
          this.setState({ version: this.state.version + 1, });
        });
        this.unSubscribe = unSubscribe;
      }

      static getDerivedStateFromProps() {
        return {
          value: mapValue(lugiax.getState().get(model)),
        };
      }

      render() {
        const { value, } = this.state;
        const { valueProps = 'value', changeEvent = 'onChange', } = opt;
        const valueConfig = { [valueProps]: value, };
        const onChange = {
          [changeEvent]: this.onChange,
        };

        return <Target {...this.props} {...valueConfig} {...onChange} />;
      }

      onChange = (e: Object) => {
        trigger(mutations, e);
      };
      componentWillUnmount() {
        this.unSubscribe();
        delete this.unSubscribe;
      }
    }

    return hoistStatics(Component, Target);
  };
}
