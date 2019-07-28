/**
 *
 * create by ligx
 *
 * @flow
 */
import type { RegisterResult } from "@lugia/lugiax-core";
import lugiax from "@lugia/lugiax-core";
import hoistStatics from "hoist-non-react-statics";
import * as React from "react";
import { getDisplayName } from "./utils";

export default function(
  modelData: RegisterResult | Array<RegisterResult>,
  mapProps: (state: Object) => Object = () => ({}),
  map2Mutations: (mutations: any) => Object = () => ({}),
  opt?: { props?: Object, withRef?: boolean } = {}
) {
  if (!Array.isArray(modelData)) {
    modelData = [modelData];
  }
  const { withRef = false } = opt;

  const models = [];
  const modelMutations = [];
  const model2handle = {};
  modelData.forEach((item: Object) => {
    const { model, mutations } = item;
    models.push(model);
    model2handle[model] = item;
    modelMutations.push(mutations);
  });

  return (Target: React.ComponentType<any>) => {
    const widgetName = getDisplayName(Target);

    class Component extends React.Component<any, any> {
      static displayName = `lugiax-${widgetName}`;
      unSubscribe: Function[];

      constructor(props: any) {
        super(props);

        const modelData = [];
        const model2Index = {};
        models.forEach((model: string, index: number) => {
          model2Index[model] = index;
          modelData.push(model2handle[model].getState());
        });

        this.state = {
          modelData,
          mutations: map2Mutations(
            modelMutations.length === 1 ? modelMutations[0] : modelMutations
          )
        };

        this.unSubscribe = [];
        models.forEach(model => {
          const { unSubscribe } = lugiax.subscribe(model, () => {
            const modelData = this.state.modelData;
            modelData[model2Index[model]] = model2handle[model].getState();
            this.setState({ modelData });
          });
          this.unSubscribe.push(unSubscribe);
        });
      }

      static getDerivedStateFromProps(nextProps: Object, state: Object) {
        const models = state.modelData;
        return {
          props: mapProps(models.length === 1 ? models[0] : models)
        };
      }
      target: any;
      render() {
        const { props, mutations } = this.state;
        const topProps = opt && opt.props ? opt.props : {};
        const refConfig: Object = {};

        if (withRef === true) {
          refConfig.ref = (cmp: any) => {
            this.target = cmp;
          };
        }
        return (
          <Target
            {...props}
            {...mutations}
            {...this.props}
            {...topProps}
            {...refConfig}
          />
        );
      }

      getWrappedInstance() {
        if (this.target) {
          return this.target;
        }
      }

      componentDidUpdate(): void {
        const { lugiaxDidUpdate } = this.props;
        lugiaxDidUpdate && lugiaxDidUpdate();
      }

      componentDidMount(): void {
        const { lugiaxDidMount } = this.props;
        lugiaxDidMount && lugiaxDidMount();
      }

      componentWillUnmount() {
        this.unSubscribe.forEach(cb => cb());
        delete this.unSubscribe;
      }
    }

    return hoistStatics(Component, Target);
  };
}
