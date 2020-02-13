/**
 *
 * create by ligx
 *
 * @flow
 */
import type { ConnectOptionType } from "@lugia/lugiax";
import type { RegisterResult } from "@lugia/lugiax-core";
import lugiax from "@lugia/lugiax-core";
import hoistStatics from "hoist-non-react-statics";
import * as React from "react";
import { getDisplayName } from "./utils";

const Noop = () => ({});
export default function(
  modelData: RegisterResult | Array<RegisterResult>,
  mapProps: (state: Object) => Object = Noop,
  map2Mutations: (mutations: any) => Object = Noop,
  opt: ?ConnectOptionType = {}
) {
  if (!map2Mutations) {
    map2Mutations = Noop;
  }
  if (!Array.isArray(modelData)) {
    modelData = [modelData];
  }

  const modelNames = [];
  const modelMutations = [];
  const name2Model = {};
  modelData.forEach((item: Object) => {
    const { model, mutations } = item;
    modelNames.push(model);
    name2Model[model] = item;
    modelMutations.push(mutations);
  });

  function isValidModel(modelName: string, modelObject: Object): boolean {
    if (!modelObject.getState) {
      console.error(
        `mode(modelName = ${modelName}) is error, mode value is (${modelObject}).`
      );
      return false;
    }
    return true;
  }

  const { areStateEqual, areStatePropsEqual } = opt;
  return (Target: React.ComponentType<any>) => {
    const widgetName = getDisplayName(Target);

    class Component extends React.Component<any, any> {
      static displayName = `lugiax-${widgetName}`;
      unSubscribe: Function[];

      constructor(props: any) {
        super(props);

        const modelData = [];
        const model2Index = {};
        modelNames.forEach((modelName: string, index: number) => {
          model2Index[modelName] = index;
          const model = name2Model[modelName];
          if (!isValidModel(modelName, model)) {
            return;
          }
          modelData.push(model.getState());
        });

        this.state = {
          modelData,
          mutations: map2Mutations(
            modelMutations.length === 1 ? modelMutations[0] : modelMutations
          )
        };

        this.unSubscribe = [];
        modelNames.forEach((modelName: string) => {
          const { unSubscribe } = lugiax.subscribe(modelName, () => {
            const modelData = this.state.modelData;
            const model = name2Model[modelName];
            if (!isValidModel(modelName, model)) {
              return;
            }
            const modelIndex = model2Index[modelName];
            const oldState = modelData[modelIndex];
            const newState = model.getState();
            modelData[modelIndex] = newState;
            if (areStateEqual && !areStateEqual(oldState, newState)) {
              return;
            }
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

      shouldComponentUpdate(nextProps: Object, nextState: Object) {
        const { props: preStateProps } = this.state;
        const { props: nextStateProps } = nextState;
        if (areStatePropsEqual) {
          return areStatePropsEqual(preStateProps, nextStateProps);
        }
        return true;
      }

      target: any;
      render() {
        const { props, mutations } = this.state;
        const { withRef = false, props: topProps = {} } = opt;

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
