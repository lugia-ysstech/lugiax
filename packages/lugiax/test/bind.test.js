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
import { bind, connect } from "../src/";
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

  it("option withRef true ", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    const result = "hello world";
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
        withRef: true,
        props: undefined
      }
    )(
      class Input extends React.Component<any, any> {
        static displayName = DisplayName;

        getName() {
          return result;
        }

        render() {
          return [
            <input {...this.props} />,
            <input value={this.props.title} />
          ];
        }
      }
    );

    class Form extends React.Component {
      render() {
        return <MyInput ref={cmp => (this.myInput = cmp)} />;
      }
    }

    const target = mount(<Form />);
    expect(target.instance().myInput.target.getName()).toEqual(result);
  });

  it("option areStateEqual false", async () => {
    const name = "ligx";
    const newName = "fsasadklf";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    let callCount = 0;
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
        areStateEqual(oldModel, newModel) {
          callCount++;

          return (
            oldModel.getIn(["form", "name"]) === newModel.get(["form", "name"])
          );
        }
      }
    )(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(callCount).toBe(1);
  });

  it("option areStateEqual false  render zero", async () => {
    const initName = "ligx";
    const firstChangeName = "fsasadklf";
    const secondChangeName = "lkfjlasdfsaf";
    const pwd = "123456";
    const userModel = createDeepUserModel(initName, pwd);
    let callCount = 0;
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
        areStateEqual(oldModel, newModel) {
          callCount++;

          if (callCount === 1) {
            const check =
              oldModel.getIn(["form", "name"]) === initName &&
              newModel.getIn(["form", "name"]) === firstChangeName;

            if (!check) {
              throw new Error("第1次更新的模型入参的值错误");
            }
          }
          if (callCount === 2) {
            const check =
              oldModel.getIn(["form", "name"]) === firstChangeName &&
              newModel.getIn(["form", "name"]) === secondChangeName;

            if (!check) {
              throw new Error("第2次更新的模型入参的值错误");
            }
          }
          return false;
        }
      }
    )(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(initName);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: firstChangeName });
    expect(getInputValue(target.find("input").at(0))).toBe(initName);

    changeName({ name: secondChangeName });
    expect(getInputValue(target.find("input").at(0))).toBe(initName);

    expect(callCount).toBe(2);
  });

  it("option areStateEqual true", async () => {
    const name = "ligx";
    const newName = "fsasadklf";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    let callCount = 0;
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
        areStateEqual(oldModel, newModel) {
          callCount++;

          return (
            oldModel.getIn(["form", "name"]) === name &&
            newModel.getIn(["form", "name"]) === newName
          );
        }
      }
    )(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(newName);
    expect(callCount).toBe(1);
  });

  it("option areStateEqual true  render twice", async () => {
    const initName = "ligx";
    const firstChangeName = "fsasadklf";
    const secondChangeName = "lkfjlasdfsaf";
    const pwd = "123456";
    const userModel = createDeepUserModel(initName, pwd);
    let callCount = 0;
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
        areStateEqual(oldModel, newModel) {
          callCount++;

          if (callCount === 1) {
            const check =
              oldModel.getIn(["form", "name"]) === initName &&
              newModel.getIn(["form", "name"]) === firstChangeName;

            if (!check) {
              throw new Error("第1次更新的模型入参的值错误");
            }
          }
          if (callCount === 2) {
            const check =
              oldModel.getIn(["form", "name"]) === firstChangeName &&
              newModel.getIn(["form", "name"]) === secondChangeName;

            if (!check) {
              throw new Error("第2次更新的模型入参的值错误");
            }
          }

          return true;
        }
      }
    )(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(initName);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: firstChangeName });
    expect(getInputValue(target.find("input").at(0))).toBe(firstChangeName);

    changeName({ name: secondChangeName });
    expect(getInputValue(target.find("input").at(0))).toBe(secondChangeName);

    expect(callCount).toBe(2);
  });

  it("option areStatePropsEqual true", async () => {
    const name = "ligx";
    const newName = "wwww";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    let callCount = 0;
    let MyInput = bind(
      userModel,
      model => {
        return {
          name: model.get("form").get("name")
        };
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        }
      },
      {
        areStatePropsEqual(oldStateProps, newStateProps) {
          callCount++;
          return oldStateProps.name === name && newStateProps.name === newName;
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return <input value={this.props.name} />;
        }
      }
    );

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(newName);
    expect(callCount).toBe(1);
  });

  it("option areStatePropsEqual false", async () => {
    const name = "ligx";
    const newName = "wwww";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);
    let callCount = 0;
    let MyInput = bind(
      userModel,
      model => {
        return {
          name: model.get("form").get("name")
        };
      },
      {
        onChange: (mutations, e) => {
          return mutations.changeName({ name: e.target.value });
        }
      },
      {
        areStatePropsEqual(oldStateProps, newStateProps) {
          callCount++;
          return oldStateProps.name === newStateProps.name;
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return <input value={this.props.name} />;
        }
      }
    );

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(callCount).toBe(1);
  });

  it("option areOwnPropsEqual true", async () => {
    const name = "ligx";
    const newName = "wwww";
    const pwd = "123456";
    const hello = "hello";

    const userModel = createDeepUserModel(name, pwd);
    const hellModule = lugiax.register({
      model: "hello",
      state: { hello },
      mutations: {
        sync: {
          changeInfo(data: Object, inParam: Object) {
            return data.set("hello", inParam.value);
          }
        }
      }
    });
    let callCount = 0;
    let MyInput = bind(
      hellModule,
      model => {
        return {
          hello: model.get("hello")
        };
      },
      null,
      {
        areOwnPropsEqual(oldProps, newProps) {
          callCount++;
          return oldProps.hello === name && newProps.hello === newName;
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return <input value={this.props.hello} />;
        }
      }
    );

    const From = connect(userModel, state => {
      return {
        hello: state.get("form").get("name")
      };
    })(
      class PropsInput extends React.Component {
        render() {
          return <MyInput {...this.props} />;
        }
      }
    );

    const target = mount(<From />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(newName);
    expect(callCount).toBe(1);
  });

  it("option areOwnPropsEqual false", async () => {
    const name = "ligx";
    const newName = "wwww";
    const pwd = "123456";
    const hello = "hello";

    const userModel = createDeepUserModel(name, pwd);
    const hellModule = lugiax.register({
      model: "hello",
      state: { hello },
      mutations: {
        sync: {
          changeInfo(data: Object, inParam: Object) {
            return data.set("hello", inParam.value);
          }
        }
      }
    });
    let callCount = 0;
    let MyInput = bind(
      hellModule,
      model => {
        return {
          hello: model.get("hello")
        };
      },
      null,
      {
        areOwnPropsEqual(oldProps, newProps) {
          callCount++;
          return !(oldProps.hello === name && newProps.hello === newName);
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return <input value={this.props.hello} />;
        }
      }
    );

    const From = connect(userModel, state => {
      return {
        hello: state.get("form").get("name")
      };
    })(
      class PropsInput extends React.Component {
        render() {
          return <MyInput {...this.props} />;
        }
      }
    );

    const target = mount(<From />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(callCount).toBe(1);
  });

  it("option areOwnPropsEqual false and areStatePropsEqual true", async () => {
    const name = "ligx";
    const newName = "world";
    const pwd = "123456";
    const hello = "hello";

    const userModel = createDeepUserModel(name, pwd);
    const hellModule = lugiax.register({
      model: "hello",
      state: { hello },
      mutations: {
        sync: {
          changeInfo(data: Object, inParam: Object) {
            return data.set("hello", inParam.value);
          }
        }
      }
    });
    let callCount = 0;
    let MyInput = bind(
      hellModule,
      model => {
        return {
          hello: model.get("hello")
        };
      },
      null,
      {
        areOwnPropsEqual(oldProps, newProps) {
          callCount++;
          return !(oldProps.hello === "ligx" && newProps.hello === "world");
        },
        areStatePropsEqual() {
          callCount++;
          return true;
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return <input value={this.props.hello} />;
        }
      }
    );

    const From = connect(userModel, state => {
      return {
        hello: state.get("form").get("name")
      };
    })(
      class PropsInput extends React.Component {
        render() {
          return <MyInput {...this.props} />;
        }
      }
    );

    const target = mount(<From />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(callCount).toBe(2);
  });

  it("option areOwnPropsEqual true and areStatePropsEqual false", async () => {
    const name = "ligx";
    const newName = "wwww";
    const pwd = "123456";
    const hello = "hello";

    const userModel = createDeepUserModel(name, pwd);
    const hellModule = lugiax.register({
      model: "hello",
      state: { hello },
      mutations: {
        sync: {
          changeInfo(data: Object, inParam: Object) {
            return data.set("hello", inParam.value);
          }
        }
      }
    });
    let callCount = 0;
    let MyInput = bind(
      hellModule,
      model => {
        return {
          hello: model.get("hello")
        };
      },
      null,
      {
        areOwnPropsEqual(oldProps, newProps) {
          callCount++;
          return true;
        },
        areStatePropsEqual(oldStateProps, newStateProps) {
          callCount++;
          return false;
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return <input value={this.props.hello} />;
        }
      }
    );

    const From = connect(userModel, state => {
      return {
        hello: state.get("form").get("name")
      };
    })(
      class PropsInput extends React.Component {
        render() {
          return <MyInput {...this.props} />;
        }
      }
    );

    const target = mount(<From />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const {
      mutations: { changeName }
    } = userModel;
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(callCount).toBe(2);
  });

  function createMoreMutationModel(model, state, target, newData) {
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName(data: Object, inParam: Object, { mutations }) {
            data = mutations.changePwd({ pwd: newData.newPwd });
            return data.set("name", newData.newName);
          },
          timerChangeName(data: Object, inParam: Object, { mutations }) {
            setTimeout(() => {
              mutations.changePwd({ pwd: newData.newPwd });
            });
            return data.set("name", newData.newName);
          },
          changeNameCallAsync(data: Object, inParam: Object, { mutations }) {
            mutations.asyncChangePwd({ pwd: newData.newPwd });
            data = data.set("name", newData.newName);
            return data;
          },
          changePwd(data: Object, inParam: Object, { mutations }) {
            data = mutations.changeAge({ age: newData.newAge });
            return data.set("pwd", inParam.pwd);
          },
          changeAge(data: Object, inParam: Object) {
            return data.set("age", inParam.age);
          }
        },
        async: {
          async changeName(data: Object, inParam: Object, { mutations }) {
            data = await mutations.asyncChangePwd({
              pwd: newData.newPwd
            });
            return data.set("name", newData.newName);
          },
          async NameCallSyncFn(data: Object, inParam: Object, { mutations }) {
            data = await mutations.changePwd({ pwd: newData.newPwd });
            return data.set("name", newData.newName);
          },
          async changePwd(data: Object, inParam: Object, { mutations }) {
            data = await mutations.asyncChangeAge({ age: newData.newAge });
            return data.set("pwd", inParam.pwd);
          },
          async changeAge(data: Object, inParam: Object) {
            return data.set("age", inParam.age);
          }
        }
      }
    });
    const BindComponent = connect(userModel, (user: Object) => {
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        age: user.get("age")
      };
    })(target);
    return {
      model: userModel,
      BindComponent
    };
  }

  it("component bind Single model syncMutation deep  invoking syncMutation && render 2", () => {
    const model = "user";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      render() {
        renderCount++;
        const { name, pwd, age } = this.props;
        return [
          <input value={name} />,
          <input value={pwd} />,
          <input value={age} />
        ];
      }
    }
    const newState = {
      newName: "he",
      newPwd: "admin11",
      newAge: "2"
    };
    const { model: userModel, BindComponent } = createMoreMutationModel(
      model,
      state,
      Input,
      newState
    );
    const target = mount(<BindComponent />);

    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    const {
      mutations: { changeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    changeName();
    expect(getInputValue(target.find("input").at(0))).toEqual(newState.newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newState.newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newState.newAge);
    expect(renderCount).toEqual(2);
  });

  it("component bind Single model syncMutation setTimeout deep  invoking syncMutation && render 3", () => {
    jest.useFakeTimers();
    const model = "user";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      render() {
        renderCount++;
        const { name, pwd, age } = this.props;
        return [
          <input value={name} />,
          <input value={pwd} />,
          <input value={age} />
        ];
      }
    }
    const newState = {
      newName: "he",
      newPwd: "admin11",
      newAge: "2"
    };
    const { model: userModel, BindComponent } = createMoreMutationModel(
      model,
      state,
      Input,
      newState
    );
    const target = mount(<BindComponent />);

    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    const {
      mutations: { timerChangeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    timerChangeName();
    jest.runAllTimers();
    expect(getInputValue(target.find("input").at(0))).toEqual(newState.newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newState.newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newState.newAge);
    expect(renderCount).toEqual(3);
  });

  // it("component bind Single model && syncMutation deep invoking asyncMutation && render 2", async () => {
  //   const model = "user";
  //   const state = {
  //     name: "lugiax",
  //     pwd: "admin",
  //     age: "1"
  //   };
  //   let renderCount = 0;
  //   class Input extends React.Component<any, any> {
  //     static displayName = "MyInput";
  //     render() {
  //       renderCount++;
  //       const { name, pwd, age } = this.props;
  //       return [
  //         <input value={name} />,
  //         <input value={pwd} />,
  //         <input value={age} />
  //       ];
  //     }
  //   }
  //   const newState = {
  //     newName: "he",
  //     newPwd: "admin11",
  //     newAge: "2"
  //   };
  //   const {
  //     model: userModel,
  //     BindComponent,
  //     promise
  //   } = createMoreMutationModel(model, state, Input, newState);
  //   const target = mount(<BindComponent />);

  //   expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
  //   expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
  //   expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
  //   const {
  //     mutations: { changeNameCallAsync }
  //   } = userModel;
  //   expect(renderCount).toEqual(1);
  //   changeNameCallAsync();
  //   // await new Promise(res => {
  //   //   setTimeout(() => {
  //   //     res();
  //   //   }, 50);
  //   // });
  //   // 其实已经更新过了// 但是第二次更新的时候。更给后的值丢掉了还还原成旧值。
  //   expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
  //   expect(getInputValue(target.find("input").at(1))).toEqual(newState.newPwd);
  //   expect(getInputValue(target.find("input").at(2))).toEqual(newState.newAge);
  //   expect(renderCount).toEqual(2);
  // });

  it("component bind Single model && asyncMutation deep invoking asyncMutation && render 2", async () => {
    const model = "user";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      render() {
        renderCount++;
        const { name, pwd, age } = this.props;
        return [
          <input value={name} />,
          <input value={pwd} />,
          <input value={age} />
        ];
      }
    }
    const newState = {
      newName: "he",
      newPwd: "admin11",
      newAge: "2"
    };
    const { model: userModel, BindComponent } = createMoreMutationModel(
      model,
      state,
      Input,
      newState
    );
    const target = mount(<BindComponent />);

    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    const {
      mutations: { asyncChangeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    await asyncChangeName();
    expect(getInputValue(target.find("input").at(0))).toEqual(newState.newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newState.newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newState.newAge);
    expect(renderCount).toEqual(2);
  });

  it("component bind Single model && asyncMutation deep invoking syncMutation && render 2", async () => {
    const model = "user";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      render() {
        renderCount++;
        const { name, pwd, age } = this.props;
        return [
          <input value={name} />,
          <input value={pwd} />,
          <input value={age} />
        ];
      }
    }
    const newState = {
      newName: "he",
      newPwd: "admin11",
      newAge: "2"
    };
    const { model: userModel, BindComponent } = createMoreMutationModel(
      model,
      state,
      Input,
      newState
    );
    const target = mount(<BindComponent />);

    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    const {
      mutations: { asyncNameCallSyncFn }
    } = userModel;
    expect(renderCount).toEqual(1);
    await asyncNameCallSyncFn();
    expect(getInputValue(target.find("input").at(0))).toEqual(newState.newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newState.newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newState.newAge);
    expect(renderCount).toEqual(2);
  });
});
