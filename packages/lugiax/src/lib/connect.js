/**
 *
 * create by ligx
 *
 * @flow
 */
import type { RegisterResult, } from '@lugia/lugiax-core';
import lugiax from '@lugia/lugiax-core';
import hoistStatics from 'hoist-non-react-statics';
import * as React from 'react';
import { getDisplayName, } from './utils';

export default function(
  modelData: RegisterResult | Array<RegisterResult>,
  mapProps: (state: Object) => Object = () => ({}),
  mutations: ?Object = {}
) {
  if (!Array.isArray(modelData)) {
    modelData = [modelData,];
  }

  const models = [];
  modelData.forEach(({ model, }) => {
    models.push(model);
  });

  return (Target: React.ComponentType<any>) => {
    const widgetName = getDisplayName(Target);

    class Component extends React.Component<any, any> {
      static displayName = `lugiax-${widgetName}`;

      constructor(props: any) {
        super(props);
        this.state = { version: 0, };
        models.forEach(model => {
          lugiax.subscribe(model, () => {
            this.setState({ version: this.state.version + 1, });
          });
        });
      }

      static getDerivedStateFromProps(nextProps: Object, preState: Object) {
        const state = {};
        models.forEach(model => {
          state[model] = lugiax.getState().get(model);
        });

        const props = mapProps(state);
        return {
          props,
        };
      }

      render() {
        const { props, } = this.state;
        return <Target {...props} {...mutations} {...this.props} />;
      }
    }

    return hoistStatics(Component, Target);
  };
}
