/**
 *
 * create by ligx
 *
 * @flow
 */
import type { ConnectOptionType } from "@lugia/lugiax";
import type { RegisterResult } from "@lugia/lugiax-core";
import lugiax from "@lugia/lugiax-core";

import * as React from "react";
import {
  getDisplayName,
  combineFunction,
  withRef,
  isShouldRender,
  BatchModels
} from "./utils";
import hoistStatics from "hoist-non-react-statics";

export default function(
  modelData: RegisterResult,
  mapValue: (state: Object) => { [valueName: string]: any },
  trigger: {
    [eventName: string]: (mutations: Object, ...args: any) => any
  } = {},
  opt: ?ConnectOptionType = {}
) {
  const {
    eventHandle,
    props: optionProps = {},
    withRef: withRefEnable = false,
    areStateEqual,
    areStatePropsEqual,
    areOwnPropsEqual
  } = opt;

  const { model } = modelData;
  trigger = trigger ? trigger : {};

  return (Target: React.ComponentType<any>) => {
    const widgetName = getDisplayName(Target);

    class Component extends React.Component<any, any> {
      static displayName = `lugiax-bind-${widgetName}`;
      unSubscribe: Function;
      eventHandler: Object;
      oldModel: Object;

      constructor(props: any) {
        super(props);
        this.oldModel = modelData.getState();
        this.state = mapValue(this.oldModel);
        const { unSubscribe } = lugiax.onRender(BatchModels, renderModels => {
          if (!renderModels.includes(model)) {
            return;
          }
          const newModel = modelData.getState();
          const { oldModel } = this;
          this.oldModel = newModel;
          if (areStateEqual && !areStateEqual(oldModel, newModel)) {
            return;
          }

          this.setState(mapValue(newModel));
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

      shouldComponentUpdate(nextProps: Object, nextState: Object) {
        return isShouldRender(areStatePropsEqual, areOwnPropsEqual, {
          preState: this.state,
          nextState,
          preProps: this.props,
          nextProps
        });
      }

      render() {
        const eventMethod = combineFunction(
          this.props,
          this.eventHandler,
          eventHandle
        );
        return (
          <Target
            {...this.state}
            {...this.props}
            {...eventMethod}
            {...optionProps}
            {...withRef(withRefEnable, this)}
          />
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
