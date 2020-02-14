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
import { getDisplayName, combineFunction } from "./utils";
import hoistStatics from "hoist-non-react-statics";

export default function(
  modelData: RegisterResult,
  mapValue: (state: Object) => { [valueName: string]: any },
  trigger: {
    [eventName: string]: (mutations: Object, ...args: any) => any
  } = {},
  opt: ?ConnectOptionType = {}
) {
  const { eventHandle, props: optionProps = {} } = opt;
  const { model } = modelData;
  trigger = trigger ? trigger : {};

  return (Target: React.ComponentType<any>) => {
    const widgetName = getDisplayName(Target);

    class Component extends React.Component<any, any> {
      static displayName = `lugiax-bind-${widgetName}`;
      unSubscribe: Function;
      eventHandler: Object;

      constructor(props: any) {
        super(props);
        this.state = mapValue(modelData.getState());
        const { unSubscribe } = lugiax.subscribe(model, () => {
          this.setState(mapValue(modelData.getState()));
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
