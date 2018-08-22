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
  map2Mutations: (mutations: Object) => Object = () => ({}),
  opt?: { props: Object }
) {
  if (!Array.isArray(modelData)) {
    modelData = [modelData,];
  }

  const models = [];
  const modelMutations = {};
  modelData.forEach(({ model, mutations, }) => {
    models.push(model);
    modelMutations[model] = mutations;
  });

  return (Target: React.ComponentType<any>) => {
    const widgetName = getDisplayName(Target);

    class Component extends React.Component<any, any> {
      static displayName = `lugiax-${widgetName}`;
      unSubscribe: Function[];

      constructor(props: any) {
        super(props);
        this.state = { version: 0, };
        this.unSubscribe = [];
        models.forEach(model => {
          const { unSubscribe, } = lugiax.subscribe(model, () => {
            this.setState({ version: this.state.version + 1, });
          });
          this.unSubscribe.push(unSubscribe);
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
          mutations: map2Mutations(modelMutations),
        };
      }

      render() {
        const { props, mutations, } = this.state;
        const topProps = opt && opt.props ? opt.props : {};
        return (
          <Target {...props} {...mutations} {...this.props} {...topProps} />
        );
      }

      componentWillUnmount() {
        console.info(this.unSubscribe);

        this.unSubscribe.forEach(cb => cb());
        delete this.unSubscribe;
      }
    }

    return hoistStatics(Component, Target);
  };
}
