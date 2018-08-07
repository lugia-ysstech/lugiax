/**
 *
 * create by ligx
 *
 * @flow
 */
import type { RegisterResult, } from '@lugia/lugiax-core';
import lugiax from '@lugia/lugiax-core';
import * as React from 'react';

export function connect(
  Target: React.ComponentType<any>,
  modelData: RegisterResult | Array<RegisterResult>,
  mapProps: (state: Object) => Object
) {
  const models = [];
  if (!Array.isArray(modelData)) {
    const { model, } = modelData;
    models.push(model);
  } else {
    modelData.forEach(({ model, }) => {
      models.push(model);
    });
  }

  return class extends React.Component<any, any> {
    constructor(props: any) {
      super(props);
      this.state = { version: 0, };
      models.forEach(model => {
        lugiax.subscribe(model, (...rest) => {
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
      return <Target {...props} {...this.props} />;
    }
  };
}
