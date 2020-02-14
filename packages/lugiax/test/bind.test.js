/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from "@lugia/lugiax-core";
import React from "react";
import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { bind } from "../src/";
import { createDeepUserModel, createUserModel, getInputValue } from "./utils";

Enzyme.configure({ adapter: new Adapter() });

const DisplayName = "MyInput";

class Input extends React.Component<any, any> {
  static displayName = DisplayName;

  render() {
    return <input {...this.props} />;
  }
}

describe("lugiax.bind", () => {
  beforeEach(() => {
    lugiax.clear();
  });

  it("bind flow", () => {
    const name = "ligx";
    const pwd = "123456";
    const newPwd = "我服";
    const userModel = createUserModel(name, pwd);

    const BindInput = bind(
      userModel,
      model => {
        const result = { value: model.get("name"), pwd: model.get("pwd") };
        return result;
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        },
        onClick: (mutations, e) => {
          return mutations.changePwd({ pwd: newPwd });
        }
      }
    )(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInput />;
      }
    }

    const target = mount(<App />);
    const { model } = userModel;
    expect(
      lugiax
        .getState()
        .get(model)
        .get("name")
    ).toBe(name);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const newName = "my name is ";
    target.simulate("change", { target: { value: newName } });
    expect(
      lugiax
        .getState()
        .get(model)
        .get("name")
    ).toBe(newName);
    expect(getInputValue(target.find("input").at(0))).toBe(newName);

    const {
      mutations: { changeName }
    } = userModel;
    const thirdName = "thirdName";
    changeName({ name: thirdName });
    expect(
      lugiax
        .getState()
        .get(model)
        .get("name")
    ).toBe(thirdName);
    expect(getInputValue(target.find("input").at(0))).toBe(thirdName);

    target.simulate("click");
    expect(
      lugiax
        .getState()
        .get(model)
        .get("pwd")
    ).toBe(newPwd);
    expect(target.find(DisplayName).props().pwd).toBe(newPwd);

    const instance = target
      .children()
      .at(0)
      .instance();
    instance.componentWillUnmount.call(instance);
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(thirdName);
  });
  it("bind flow has props pwd", () => {
    const name = "ligx";
    const pwd = "123456";
    const newPwd = "我服";
    const userModel = createUserModel(name, pwd);

    const BindInput = bind(
      userModel,
      model => {
        const result = { value: model.get("name"), pwd: model.get("pwd") };
        return result;
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        },
        onClick: (mutations, e) => {
          return mutations.changePwd({ pwd: newPwd });
        }
      }
    )(Input);
    const propsValue = "ligx";

    class App extends React.Component<any, any> {
      render() {
        return <BindInput value={propsValue} />;
      }
    }

    const target = mount(<App />);
    const { model } = userModel;
    expect(
      lugiax
        .getState()
        .get(model)
        .get("name")
    ).toBe(name);
    expect(getInputValue(target.find("input").at(0))).toBe(propsValue);

    const newName = "my name is ";
    target.simulate("change", { target: { value: newName } });
    expect(
      lugiax
        .getState()
        .get(model)
        .get("name")
    ).toBe(newName);
    expect(getInputValue(target.find("input").at(0))).toBe(propsValue);

    const {
      mutations: { changeName }
    } = userModel;
    const thirdName = "thirdName";
    changeName({ name: thirdName });
    expect(
      lugiax
        .getState()
        .get(model)
        .get("name")
    ).toBe(thirdName);
    expect(getInputValue(target.find("input").at(0))).toBe(propsValue);

    target.simulate("click");
    expect(
      lugiax
        .getState()
        .get(model)
        .get("pwd")
    ).toBe(newPwd);
    expect(target.find(DisplayName).props().pwd).toBe(newPwd);

    const instance = target
      .children()
      .at(0)
      .instance();
    instance.componentWillUnmount.call(instance);
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(propsValue);
  });
  it("bind not exist eventhandler", () => {
    const name = "ligx";
    const pwd = "123456";
    const newPwd = "我服";
    const userModel = createUserModel(name, pwd);

    const BindInput = bind(
      userModel,
      model => {
        const result = { value: model.get("name"), pwd: model.get("pwd") };
        return result;
      },
      {}
    )(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInput />;
      }
    }

    const target = mount(<App />);

    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(target.find(DisplayName).props().pwd).toBe(pwd);
  });
  it("bind not exist eventhandler", () => {
    const name = "ligx";
    const pwd = "123456";
    const newPwd = "我服";
    const userModel = createUserModel(name, pwd);

    const BindInput = bind(
      userModel,
      model => {
        return {};
      },
      {}
    )(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInput />;
      }
    }

    const target = mount(<App />);

    expect(getInputValue(target.find("input").at(0))).toBe("");
    expect(target.find(DisplayName).props().pwd).toBeUndefined();
  });

  it("EventHandle onClick", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);

    let MyInput = Input;
    const changePromise = new Promise(res => {
      MyInput = bind(
        userModel,
        model => {
          return {};
        },
        {},
        {
          eventHandle: {
            onClick(e) {
              res(e.target.value);
            }
          }
        }
      )(Input);
    });
    const target = mount(<MyInput />);
    target.find(Input).simulate("click", { target: { value: name } });
    expect(await changePromise).toBe(name);
  });

  it("EventHandle onChange and MyInput has onChange", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);

    let MyInput = Input;
    const changePromise = new Promise(res => {
      MyInput = bind(
        userModel,
        model => {
          return {};
        },
        {},
        {
          eventHandle: {
            onChange(e) {
              res(e.target.value);
            }
          }
        }
      )(Input);
    });
    let onChange;
    const theChangeEvent = new Promise(res => {
      onChange = e => {
        res(e.target.value);
      };
    });
    const target = mount(<MyInput onChange={onChange} />);
    target.find(Input).simulate("change", { target: { value: name } });
    expect(await changePromise).toBe(name);
    expect(await theChangeEvent).toBe(name);
  });

  it("EventHandle onChange and MyInput has onChange and has ChangeMutation", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);

    let MyInput = Input;
    const changePromise = new Promise(res => {
      MyInput = bind(
        userModel,
        model => {
          return {
            value: model.get("form").get("name")
          };
        },
        {
          onChange: (mutations, e) => {
            return mutations.changeName({ name: e.target.value });
          }
        },
        {
          eventHandle: {
            onChange(e) {
              res(e.target.value);
            }
          }
        }
      )(Input);
    });

    let onChange;
    const theChangeEvent = new Promise(res => {
      onChange = e => {
        res(e.target.value);
      };
    });
    const newName = "无可奈何而安之若命";
    const target = mount(<MyInput onChange={onChange} />);

    expect(getInputValue(target.find("input").at(0))).toBe(name);

    target.find(Input).simulate("change", { target: { value: newName } });
    expect(getInputValue(target.find("input").at(0))).toBe(newName);
    expect(await changePromise).toBe(newName);
    expect(await theChangeEvent).toBe(newName);
  });

  it("EventHandle onChange and MyInput has onChange and has ChangeMutation", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);

    let isCall = false;
    let MyInput = bind(
      userModel,
      model => {
        return {
          value: model.get("form").get("name")
        };
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        }
      },
      {
        props: {
          onChange() {
            isCall = true;
          }
        },
        eventHandle: {
          onChange(e) {
            throw new Error("不改调用事件");
          }
        }
      }
    )(Input);

    let onChange = e => {
      throw new Error("不改调用事件");
    };

    const newName = "无可奈何而安之若命";
    const target = mount(<MyInput onChange={onChange} />);

    expect(getInputValue(target.find("input").at(0))).toBe(name);
    target.find(Input).simulate("change", { target: { value: newName } });
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(isCall).toBeTruthy();
  });

  it("option props", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    const optionName = "newName";
    const optionTitle = "newTitle";
    let MyInput = bind(
      userModel,
      model => {
        return {
          value: model.get("form").get("name")
        };
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        }
      },
      {
        props: {
          value: optionName,
          title: optionTitle
        }
      }
    )(
      class Input extends React.Component<any, any> {
        static displayName = DisplayName;

        render() {
          return [
            <input {...this.props} />,
            <input value={this.props.title} />
          ];
        }
      }
    );

    const target = mount(<MyInput title={optionTitle + 1} />);
    expect(getInputValue(target.find("input").at(0))).toBe(optionName);
    expect(getInputValue(target.find("input").at(1))).toBe(optionTitle);
  });

  it("option props null ", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    let MyInput = bind(
      userModel,
      model => {
        return {
          value: model.get("form").get("name")
        };
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        }
      },
      {
        props: null
      }
    )(
      class Input extends React.Component<any, any> {
        static displayName = DisplayName;

        render() {
          return [
            <input {...this.props} />,
            <input value={this.props.title} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
  });
  it("option props undefined ", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    let MyInput = bind(
      userModel,
      model => {
        return {
          value: model.get("form").get("name")
        };
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        }
      },
      {
        props: undefined
      }
    )(
      class Input extends React.Component<any, any> {
        static displayName = DisplayName;

        render() {
          return [
            <input {...this.props} />,
            <input value={this.props.title} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
  });
  it("option props {} ", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    let MyInput = bind(
      userModel,
      model => {
        return {
          value: model.get("form").get("name")
        };
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        }
      },
      {
        props: {}
      }
    )(
      class Input extends React.Component<any, any> {
        static displayName = DisplayName;

        render() {
          return [
            <input {...this.props} />,
            <input value={this.props.title} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
  });
  it("option props number ", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    let MyInput = bind(
      userModel,
      model => {
        return {
          value: model.get("form").get("name")
        };
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        }
      },
      {
        props: 1
      }
    )(
      class Input extends React.Component<any, any> {
        static displayName = DisplayName;

        render() {
          return [
            <input {...this.props} />,
            <input value={this.props.title} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
  });
});
