/**
 *
 * create by ligx
 *
 * @flow
 */
import lugiax from "@lugia/lugiax-core";
import { connect } from "../src";
import React from "react";
import Enzyme, { mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import { createUserModel, getInputValue } from "./utils";

Enzyme.configure({ adapter: new Adapter() });

const name = "︿(￣︶￣)︿";

class Input extends React.Component<any, any> {
  static displayName = "MyInput";
  onClick = () => {
    this.props.changeName({ name });
  };

  render() {
    const { name, pwd, mask } = this.props;
    return [
      <input value={name} />,
      <input value={pwd} />,
      <input value={mask} />,
      <button onClick={this.onClick} />
    ];
  }
}

describe("lugiax.connect", () => {
  beforeEach(() => {
    lugiax.clear();
  });

  it("connect only one model", () => {
    oneModelCase();
  });

  function oneModelCase(opt?: Object) {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);
    const MyInput = connect(
      userModel,
      (user: Object) => {
        return {
          name: user.get("name"),
          pwd: user.get("pwd")
        };
      },
      user => ({ changeName: user.changeName }),
      opt
    )(Input);

    const mask = "I'm mask";
    const target: Object = mount(<MyInput mask={mask} />);

    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    expect(getInputValue(target.find("input").at(2))).toBe(mask);
    return { target, userModel };
  }

  it("connect only one model for state change", () => {
    const { target, userModel } = oneModelCase();
    const {
      mutations: { changeName }
    } = userModel;
    const name = "hello new name";
    changeName({ name });
    expect(getInputValue(target.find("input").at(0))).toBe(name);
  });

  it("connect withRef true", () => {
    const { target } = oneModelCase({
      withRef: true
    });

    expect(
      target.instance().getWrappedInstance() instanceof Input
    ).toBeTruthy();
  });

  it("connect withRef false", () => {
    const { target } = oneModelCase({
      withRef: false
    });

    expect(target.instance().getWrappedInstance()).toBeUndefined();
  });

  it("connect withRef default is false", () => {
    const { target } = oneModelCase({});
    expect(target.instance().getWrappedInstance()).toBeUndefined();
  });

  it("connect only one model for async state change", async () => {
    const { target, userModel } = oneModelCase();
    const {
      mutations: { asyncChangePwd }
    } = userModel;
    const pwd = "1234567";
    await asyncChangePwd({ pwd });
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
  });

  function createInfoModel(info: any = "") {
    return lugiax.register({
      model: "info",
      state: { info },
      mutations: {
        sync: {
          changeInfo(data: Object, inParam: Object) {
            return data.set("info", inParam.value);
          }
        }
      }
    });
  }

  it('connect only render by model "user" ', () => {
    const name = "ligx";
    const pwd = "helol";
    const userModel = createUserModel(name, pwd);

    const {
      mutations: { changeInfo }
    } = createInfoModel();

    let renderCnt = 0;

    const MyInput = connect(userModel, (user: Object) => {
      return {
        name: user.get("name"),
        pwd: user.get("pwd")
      };
    })(
      class extends React.Component<any> {
        render() {
          renderCnt++;
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />
          ];
        }
      }
    );
    const target = mount(<MyInput />);
    expect(renderCnt).toBe(1);
    changeInfo({ value: "helolo" });
    expect(renderCnt).toBe(1);
    const {
      mutations: { changeName }
    } = userModel;
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    const newName = "abcd";
    changeName({ name: newName });

    expect(getInputValue(target.find("input").at(0))).toBe(newName);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);

    expect(renderCnt).toBe(2);
  });

  it("connect twoModel ", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "info";
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);

    const MyInput = connect([userModel, infoModel], (state: Object) => {
      const [user, info] = state;
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        info: info.get("info")
      };
    })(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    expect(getInputValue(target.find("input").at(2))).toBe(info);
  });

  it("connect to [] ", () => {
    const MyInput = connect([[], []], (state: Object) => {
      return {};
    })(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toEqual("");
    expect(getInputValue(target.find("input").at(1))).toEqual("");
    expect(getInputValue(target.find("input").at(2))).toEqual("");
  });

  it("connect only one model for state change by click", () => {
    const { target } = oneModelCase();

    target.find("button").simulate("click");
    expect(getInputValue(target.find("input").at(0))).toBe(name);
  });
  it("topProps", async () => {
    let opt;
    const waitChangeName = new Promise(res => {
      opt = {
        props: {
          changeName({ name }) {
            res(name);
          }
        }
      };
    });
    const { target } = oneModelCase(opt);

    target.find("button").simulate("click");
    expect(getInputValue(target.find("input").at(0))).toBe("ligx");
    expect(await waitChangeName).toBe(name);
  });
  it("unmount ", () => {
    const name = "ligx";
    const pwd = "helol";
    const userModel = createUserModel(name, pwd);
    const MyInput = connect(
      userModel,
      (user: Object) => {
        return {
          name: user.get("name"),
          pwd: user.get("pwd")
        };
      },
      user => ({ changeName: user.changeName })
    )(Input);

    class App extends React.Component<any, any> {
      render() {
        return <MyInput />;
      }
    }

    const {
      mutations: { changeName }
    } = userModel;
    const target = mount(<App />);

    const instance = target
      .children()
      .at(0)
      .instance();
    instance.componentWillUnmount.call(instance);
    const newName = "newName newName";
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(name);
  });

  it("connect Single model areStateEqual true", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const userModel = createUserModel(name, pwd);
    let oldModelState = {};
    let newModelState = {};

    let callCount = 0;
    const MyInput = connect(
      userModel,
      (state: Object) => {
        return {
          name: state.get("name"),
          pwd: state.get("pwd")
        };
      },
      null,
      {
        areStateEqual(oldState, newState) {
          oldModelState = oldState;
          newModelState = newState;
          callCount++;
          return true;
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);

    const {
      mutations: { changeName }
    } = userModel;
    let newName = "world";
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(newName);
    expect(
      Object.prototype.toString.call(oldModelState) === "[object Object]"
    ).toBe(true);
    expect(
      Object.prototype.toString.call(newModelState) === "[object Object]"
    ).toBe(true);
    let afterChangeData = oldModelState.toJS();
    afterChangeData["name"] = newName;
    expect(afterChangeData).toEqual(newModelState.toJS());
  });

  it("connect Single model areStateEqual false && areStateEqual parameter is object", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const userModel = createUserModel(name, pwd);
    let oldModelState = {};
    let newModelState = {};

    let callCount = 0;
    const MyInput = connect(
      userModel,
      (state: Object) => {
        return {
          name: state.get("name"),
          pwd: state.get("pwd")
        };
      },
      null,
      {
        areStateEqual(oldState, newState) {
          oldModelState = oldState;
          newModelState = newState;
          callCount++;
          return false;
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    const {
      mutations: { changeName }
    } = userModel;
    let newName = "world";
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    expect(
      Object.prototype.toString.call(oldModelState) === "[object Object]"
    ).toBe(true);
    expect(
      Object.prototype.toString.call(newModelState) === "[object Object]"
    ).toBe(true);
    expect(oldModelState.toJS()).not.toEqual(newModelState.toJS());
  });

  it("connect twoModel areStateEqual true && areStateEqual parameter is object", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);
    let oldModelState = {};
    let newModelState = {};

    let callCount = 0;
    const MyInput = connect(
      [userModel, infoModel],
      (state: Object) => {
        const [user, info] = state;
        return {
          name: user.get("name"),
          pwd: user.get("pwd"),
          info: info.get("info")
        };
      },
      null,
      {
        areStateEqual(oldState, newState) {
          oldModelState = oldState;
          newModelState = newState;
          const [olduser, oldInfo] = oldState;
          const [newUser, newInfo] = newState;
          callCount++;
          return oldInfo.get("info").length < newInfo.get("info").length;
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(info);

    const {
      mutations: { changeInfo }
    } = infoModel;
    let newInfo = "world";
    changeInfo({ value: newInfo });

    expect(getInputValue(target.find("input").at(2))).toEqual(newInfo);
    expect(callCount).toBe(1);

    let [oldUserModelState, oldInfoModelState] = oldModelState;
    let [newUserModelState, newInfoModelState] = newModelState;
    let afterChangeData = oldInfoModelState.toJS();
    afterChangeData["info"] = newInfo;
    expect(Array.isArray(oldModelState)).toBe(true);
    expect(Array.isArray(newModelState)).toBe(true);
    expect(afterChangeData).toEqual(newInfoModelState.toJS());
    expect(oldUserModelState.toJS()).toEqual(newUserModelState.toJS());
  });

  it("connect twoModel areStateEqual true render twice", () => {
    const name = "ligx";
    const pwd = "helol";
    const initInfo = "ligx";
    let oldModelState = {};
    let newModelState = {};

    const infoModel = createInfoModel(initInfo);
    const userModel = createUserModel(name, pwd);

    let callCount = 0;
    const MyInput = connect(
      [userModel, infoModel],
      (state: Object) => {
        const [user, info] = state;
        return {
          name: user.get("name"),
          pwd: user.get("pwd"),
          info: info.get("info")
        };
      },
      null,
      {
        areStateEqual(oldState, newState) {
          oldModelState = oldState;
          newModelState = newState;
          const [, oldInfo] = oldState;
          const [, newInfo] = newState;
          callCount++;
          return oldInfo.get("info").length < newInfo.get("info").length;
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(initInfo);

    const {
      mutations: { changeInfo }
    } = infoModel;

    const firstInfo = "ligx1";
    changeInfo({ value: firstInfo });
    expect(getInputValue(target.find("input").at(2))).toEqual(firstInfo);
    expect(callCount).toBe(1);

    const secondInfo = "ligx11";
    changeInfo({ value: secondInfo });
    expect(getInputValue(target.find("input").at(2))).toEqual(secondInfo);
    expect(callCount).toBe(2);

    let [oldUserModelState, oldInfoModelState] = oldModelState;
    let [newUserModelState, newInfoModelState] = newModelState;
    expect(Array.isArray(oldModelState)).toBe(true);
    expect(Array.isArray(newModelState)).toBe(true);
    let afterChangeData = oldInfoModelState.toJS();
    afterChangeData["info"] = secondInfo;
    expect(afterChangeData).toEqual(newInfoModelState.toJS());
    expect(oldUserModelState.toJS()).toEqual(newUserModelState.toJS());
  });

  it("connect twoModel areStateEqual false", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);
    let oldModelState = {};
    let newModelState = {};

    let callCount = 0;
    const MyInput = connect(
      [userModel, infoModel],
      (state: Object) => {
        const [user, info] = state;
        return {
          name: user.get("name"),
          pwd: user.get("pwd"),
          info: info.get("info")
        };
      },
      null,
      {
        areStateEqual(oldState, newState) {
          oldModelState = oldState;
          newModelState = newState;
          const [, oldInfo] = oldState;
          const [, newInfo] = newState;
          callCount++;
          return oldInfo.get("info") === newInfo.get("info");
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(info);

    const {
      mutations: { changeInfo }
    } = infoModel;
    let newInfo = "world";
    changeInfo({ value: newInfo });

    expect(getInputValue(target.find("input").at(2))).toEqual(info);
    expect(callCount).toBe(1);
    expect(Array.isArray(oldModelState)).toBe(true);
    expect(Array.isArray(newModelState)).toBe(true);
    let [oldUserModelState, oldInfoModelState] = oldModelState;
    let [newUserModelState, newInfoModelState] = newModelState;
    expect(oldInfoModelState.toJS()).not.toEqual(newInfoModelState.toJS());
    expect(oldUserModelState.toJS()).toEqual(newUserModelState.toJS());
  });

  it("connect twoModel areStateEqual false render twice", () => {
    const name = "ligx";
    const pwd = "helol";
    const initInfo = "ligx";
    const infoModel = createInfoModel(initInfo);
    const userModel = createUserModel(name, pwd);
    let oldModelState = {};
    let newModelState = {};

    let callCount = 0;
    const MyInput = connect(
      [userModel, infoModel],
      (state: Object) => {
        const [user, info] = state;
        return {
          name: user.get("name"),
          pwd: user.get("pwd"),
          info: info.get("info")
        };
      },
      null,
      {
        areStateEqual(oldState, newState) {
          const [, oldInfo] = oldState;
          oldModelState = oldState;
          newModelState = newState;
          const [, newInfo] = newState;
          callCount++;
          return oldInfo.get("info") === newInfo.get("info");
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(initInfo);

    const {
      mutations: { changeInfo }
    } = infoModel;
    const firstInfo = "ligx1";

    changeInfo({ value: firstInfo });
    expect(getInputValue(target.find("input").at(2))).toEqual(initInfo);
    expect(callCount).toBe(1);

    const secondInfo = "ligx2";
    changeInfo({ value: secondInfo });
    expect(getInputValue(target.find("input").at(2))).toEqual(initInfo);
    expect(callCount).toBe(2);
    expect(Array.isArray(oldModelState)).toBe(true);
    expect(Array.isArray(newModelState)).toBe(true);
    let [oldUserModelState, oldInfoModelState] = oldModelState;
    let [newUserModelState, newInfoModelState] = newModelState;
    let afterChangeData = oldInfoModelState.toJS();
    afterChangeData["info"] = secondInfo;
    expect(afterChangeData).toEqual(newInfoModelState.toJS());
    expect(oldUserModelState.toJS()).toEqual(newUserModelState.toJS());
  });

  it("connect twoModel areStatePropsEqual true", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);

    let callCount = 0;
    const MyInput = connect(
      [userModel, infoModel],
      (state: Object) => {
        const [user, info] = state;
        return {
          name: user.get("name"),
          pwd: user.get("pwd"),
          info: info.get("info")
        };
      },
      null,
      {
        areStatePropsEqual(oldStateProps, newStateProps) {
          callCount++;
          return (
            oldStateProps.info === "ligx" && newStateProps.info === "world"
          );
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(info);

    const {
      mutations: { changeInfo }
    } = infoModel;
    let newInfo = "world";
    changeInfo({ value: newInfo });

    expect(getInputValue(target.find("input").at(2))).toEqual(newInfo);
    expect(callCount).toBe(1);
  });
  it("connect twoModel areStatePropsEqual false", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);

    let callCount = 0;
    const MyInput = connect(
      [userModel, infoModel],
      (state: Object) => {
        const [user, info] = state;
        return {
          name: user.get("name"),
          pwd: user.get("pwd"),
          info: info.get("info")
        };
      },
      null,
      {
        areStatePropsEqual(oldStateProps, newStateProps) {
          callCount++;
          return !(
            oldStateProps.info === "ligx" && newStateProps.info === "world"
          );
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [
            <input value={this.props.name} />,
            <input value={this.props.pwd} />,
            <input value={this.props.info} />
          ];
        }
      }
    );

    const target = mount(<MyInput />);
    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toBe(name);
    expect(getInputValue(target.find("input").at(1))).toBe(pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(info);

    const {
      mutations: { changeInfo }
    } = infoModel;
    let newInfo = "world";
    changeInfo({ value: newInfo });

    expect(getInputValue(target.find("input").at(2))).toEqual(info);
    expect(callCount).toBe(1);
  });

  it("connect twoModel areOwnPropsEqual true", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);

    let callCount = 0;
    const MyInput = connect(
      infoModel,
      (state: Object) => {
        return {
          info: state.get("info")
        };
      },
      null,
      {
        areOwnPropsEqual(oldProps, newProps) {
          callCount++;
          console.info(oldProps, newProps);
          return oldProps.hello === "ligx" && newProps.hello === "world";
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [<input value={this.props.hello} />];
        }
      }
    );

    const From = connect(userModel, state => {
      return {
        hello: state.get("name")
      };
    })(
      class PropsInput extends React.Component {
        render() {
          return <MyInput {...this.props} />;
        }
      }
    );

    const target = mount(<From />);

    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toEqual(name);

    const {
      mutations: { changeName }
    } = userModel;
    let newName = "world";
    changeName({ name: newName });

    expect(getInputValue(target.find("input").at(0))).toEqual(newName);
    expect(callCount).toBe(1);
  });

  it("connect twoModel areOwnPropsEqual false", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);

    let callCount = 0;
    const MyInput = connect(
      infoModel,
      (state: Object) => {
        return {
          info: state.get("info")
        };
      },
      null,
      {
        areOwnPropsEqual(oldProps, newProps) {
          callCount++;
          console.info(oldProps, newProps);
          return !(oldProps.hello === "ligx" && newProps.hello === "world");
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [<input value={this.props.hello} />];
        }
      }
    );

    const From = connect(userModel, state => {
      return {
        hello: state.get("name")
      };
    })(
      class PropsInput extends React.Component {
        render() {
          return <MyInput {...this.props} />;
        }
      }
    );

    const target = mount(<From />);

    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toEqual(name);

    const {
      mutations: { changeName }
    } = userModel;
    let newName = "world";
    changeName({ name: newName });

    expect(getInputValue(target.find("input").at(0))).toEqual(name);
    expect(callCount).toBe(1);
  });

  it("connect twoModel areOwnPropsEqual false areStatePropsEqual true", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);

    let callCount = 0;
    const MyInput = connect(
      infoModel,
      (state: Object) => {
        return {
          info: state.get("info")
        };
      },
      null,
      {
        areStatePropsEqual() {
          callCount++;
          return true;
        },
        areOwnPropsEqual(oldProps, newProps) {
          callCount++;
          console.info(oldProps, newProps);
          return !(oldProps.hello === "ligx" && newProps.hello === "world");
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [<input value={this.props.hello} />];
        }
      }
    );

    const From = connect(userModel, state => {
      return {
        hello: state.get("name")
      };
    })(
      class PropsInput extends React.Component {
        render() {
          return <MyInput {...this.props} />;
        }
      }
    );

    const target = mount(<From />);

    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toEqual(name);

    const {
      mutations: { changeName }
    } = userModel;
    let newName = "world";
    changeName({ name: newName });

    expect(getInputValue(target.find("input").at(0))).toEqual(name);
    expect(callCount).toBe(2);
  });
  it("connect twoModel areOwnPropsEqual true areStatePropsEqual false", () => {
    const name = "ligx";
    const pwd = "helol";
    const info = "ligx";
    const infoModel = createInfoModel(info);
    const userModel = createUserModel(name, pwd);

    let callCount = 0;
    const MyInput = connect(
      infoModel,
      (state: Object) => {
        return {
          info: state.get("info")
        };
      },
      null,
      {
        areStatePropsEqual() {
          callCount++;
          return false;
        },
        areOwnPropsEqual(oldProps, newProps) {
          callCount++;
          console.info(oldProps, newProps);
          return oldProps.hello === "ligx" && newProps.hello === "world";
        }
      }
    )(
      class extends React.Component<any> {
        render() {
          return [<input value={this.props.hello} />];
        }
      }
    );

    const From = connect(userModel, state => {
      return {
        hello: state.get("name")
      };
    })(
      class PropsInput extends React.Component {
        render() {
          return <MyInput {...this.props} />;
        }
      }
    );

    const target = mount(<From />);

    expect(callCount).toBe(0);
    expect(getInputValue(target.find("input").at(0))).toEqual(name);

    const {
      mutations: { changeName }
    } = userModel;
    let newName = "world";
    changeName({ name: newName });

    expect(getInputValue(target.find("input").at(0))).toEqual(name);
    expect(callCount).toBe(2);
  });
  it("connect opt eventHandle exist handleFn and props exist handleFn to merge", () => {
    let callCount = 0;
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.update();
      };

      render() {
        return [<button onClick={this.onClick} />];
      }
    }
    const MyInput = connect(
      userModel,
      (user: Object) => {
        return {
          name: user.get("name"),
          pwd: user.get("pwd")
        };
      },
      user => ({ changeName: user.changeName }),
      {
        eventHandle: {
          update() {
            callCount++;
          }
        }
      }
    )(Input);

    const target: Object = mount(
      <MyInput
        update={() => {
          callCount++;
        }}
      />
    );
    target.find("button").simulate("click");
    expect(callCount).toBe(2);
  });
  it("connect opt eventHandle exist handleFn by call", () => {
    let callCount = 0;
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.update();
      };

      render() {
        return [<button onClick={this.onClick} />];
      }
    }
    const MyInput = connect(
      userModel,
      (user: Object) => {
        return {
          name: user.get("name"),
          pwd: user.get("pwd")
        };
      },
      user => ({ changeName: user.changeName }),
      {
        eventHandle: {
          update() {
            callCount++;
          }
        }
      }
    )(Input);

    const target: Object = mount(<MyInput />);
    target.find("button").simulate("click");
    expect(callCount).toBe(1);
  });

  it("connect target exist handleFn by call", () => {
    let callCount = 0;
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.update();
      };

      render() {
        return [<button onClick={this.onClick} />];
      }
    }
    const MyInput = connect(
      userModel,
      (user: Object) => {
        return {
          name: user.get("name"),
          pwd: user.get("pwd")
        };
      },
      user => ({ changeName: user.changeName })
    )(Input);

    const target: Object = mount(
      <MyInput
        update={() => {
          callCount++;
        }}
      />
    );
    target.find("button").simulate("click");
    expect(callCount).toBe(1);
  });

  it("component connct Single model syncMutation deep  invoking syncMutation && render 2 ", () => {
    const model = "user";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    const newName = "he";
    const newPwd = "admin11";
    const newAge = "2";
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName(data: Object, inParam: Object, { mutations }) {
            data = mutations.changePwd({ pwd: newPwd });
            return data.set("name", newName);
          },
          changePwd(data: Object, inParam: Object, { mutations }) {
            data = mutations.changeAge({ age: newAge });
            return data.set("pwd", inParam.pwd);
          },
          changeAge(data: Object, inParam: Object) {
            return data.set("age", inParam.age);
          }
        },
        async: {
          async changePwd(data: Object, inParam: Object) {
            return data.set("pwd", inParam.pwd);
          }
        }
      }
    });
    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.changeName({ name });
      };

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
    const MyInput = connect(userModel, (user: Object) => {
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        age: user.get("age")
      };
    })(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    const {
      mutations: { changeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    changeName();
    expect(getInputValue(target.find("input").at(0))).toEqual(newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newAge);
    expect(renderCount).toEqual(2);
  });

  it("component connct Single model &&  syncMutation single setTimeout deep  invoking syncMutation && render 3", () => {
    jest.useFakeTimers();
    const model = "user";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    const newName = "he";
    const newPwd = "admin11";
    const newAge = "2";
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName(data: Object, inParam: Object, { mutations }) {
            setTimeout(() => {
              data = mutations.changePwd({ pwd: newPwd });
            });

            return data.set("name", newName);
          },
          changePwd(data: Object, inParam: Object, { mutations }) {
            console.log("changePwd");
            data = mutations.changeAge({ age: newAge });
            return data.set("pwd", inParam.pwd);
          },
          changeAge(data: Object, inParam: Object) {
            console.log("changeAge");
            return data.set("age", inParam.age);
          }
        },
        async: {
          async changePwd(data: Object, inParam: Object) {
            return data.set("pwd", inParam.pwd);
          }
        }
      }
    });
    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.changeName({ name });
      };

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
    const MyInput = connect(userModel, (user: Object) => {
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        age: user.get("age")
      };
    })(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    const {
      mutations: { changeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    changeName();
    jest.runAllTimers();
    expect(getInputValue(target.find("input").at(0))).toEqual(newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newAge);
    expect(renderCount).toEqual(3);
  });

  it("component connct Single model && syncMutation more setTimeout deep  invoking syncMutation && render 4", () => {
    jest.useFakeTimers();
    const model = "user";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    const newName = "he";
    const newPwd = "admin11";
    const newAge = "2";
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changeName(data: Object, inParam: Object, { mutations }) {
            setTimeout(() => {
              data = mutations.changePwd({ pwd: newPwd });
            });
            return data.set("name", newName);
          },
          changePwd(data: Object, inParam: Object, { mutations }) {
            setTimeout(() => {
              data = mutations.changeAge({ age: newAge });
            });
            return data.set("pwd", inParam.pwd);
          },
          changeAge(data: Object, inParam: Object) {
            return data.set("age", inParam.age);
          }
        },
        async: {
          async changePwd(data: Object, inParam: Object) {
            return data.set("pwd", inParam.pwd);
          }
        }
      }
    });
    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.changeName({ name });
      };

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
    const MyInput = connect(userModel, (user: Object) => {
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        age: user.get("age")
      };
    })(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    const {
      mutations: { changeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    changeName();
    jest.runAllTimers();
    expect(getInputValue(target.find("input").at(0))).toEqual(newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newAge);
    expect(renderCount).toEqual(4);
  });

  it("component connct Single model && asyncMutation deep invoking asyncMutation && render 2", async () => {
    jest.useFakeTimers();
    const model = "user";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    const newName = "he";
    const newPwd = "admin11";
    const newAge = "2";
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        async: {
          async changeName(data: Object, inParam: Object, { mutations }) {
            data = await mutations.asyncChangePwd({ pwd: newPwd });
            return data.set("name", newName);
          },
          async changePwd(data: Object, inParam: Object, { mutations }) {
            data = await mutations.asyncChangeAge({ age: newAge });
            return data.set("pwd", inParam.pwd);
          },
          async changeAge(data: Object, inParam: Object) {
            return data.set("age", inParam.age);
          }
        }
      }
    });
    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.changeName({ name });
      };

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
    const MyInput = connect(userModel, (user: Object) => {
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        age: user.get("age")
      };
    })(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    const {
      mutations: { asyncChangeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    await asyncChangeName();
    expect(getInputValue(target.find("input").at(0))).toEqual(newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newAge);
    expect(renderCount).toEqual(2);
  });

  it("component connct Single model && asyncMutation deep invoking syncMutation && render 2", async () => {
    const model = "user";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    let agePromise = null;
    const newName = "he";
    const newPwd = "admin11";
    const newAge = "2";
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changePwd(data: Object, inParam: Object, { mutations }) {
            agePromise = mutations.asyncChangeAge({ age: newAge });
            console.log(agePromise);
            return data.set("pwd", inParam.pwd);
          }
        },
        async: {
          async changeName(data: Object, inParam: Object, { mutations }) {
            data = mutations.changePwd({ pwd: newPwd });
            return data.set("name", newName);
          },
          async changeAge(data: Object, inParam: Object) {
            console.log("changeAge");
            return data.set("age", inParam.age);
          }
        }
      }
    });
    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.changeName({ name });
      };

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
    const MyInput = connect(userModel, (user: Object) => {
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        age: user.get("age")
      };
    })(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    const {
      mutations: { asyncChangeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    await asyncChangeName();
    agePromise.then(() => {
      expect(getInputValue(target.find("input").at(0))).toEqual(newName);
      expect(getInputValue(target.find("input").at(1))).toEqual(newPwd);
      expect(getInputValue(target.find("input").at(2))).toEqual(newAge);
      expect(renderCount).toEqual(2);
    });
  });

  it("component connct more model && syncMutation of A-model deep invoking syncMutation of B-model && render 2", async () => {
    const model = "user";
    const info = "info";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    const infoState = {
      info: "lugiax-admin"
    };
    const newName = "he";
    const newPwd = "admin11";
    const newAge = "2";
    const newInfo = "lugiax-web";
    const infoModel = lugiax.register({
      model: info,
      state: infoState,
      mutations: {
        sync: {
          changeInfo(data: Object, inParam: Object, { mutations }) {
            return data.set("info", newInfo);
          }
        },
        async: {
          async changeInfo(data: Object, inParam: Object, { mutations }) {
            return data.set("info", newInfo);
          }
        }
      }
    });
    const {
      mutations: { changeInfo }
    } = infoModel;
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changePwd(data: Object, inParam: Object, { mutations }) {
            data = mutations.changeAge({ age: newAge });
            changeInfo();
            return data.set("pwd", inParam.pwd);
          },
          changeName(data: Object, inParam: Object, { mutations }) {
            data = mutations.changePwd({ pwd: newPwd });
            return data.set("name", newName);
          },
          changeAge(data: Object, inParam: Object) {
            return data.set("age", inParam.age);
          }
        },
        async: {}
      }
    });

    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.changeName({ name });
      };

      render() {
        renderCount++;
        const { name, pwd, age, info } = this.props;
        return [
          <input value={name} />,
          <input value={pwd} />,
          <input value={age} />,
          <input value={info} />
        ];
      }
    }
    const MyInput = connect([userModel, infoModel], (state: Object) => {
      const [user, info] = state;
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        age: user.get("age"),
        info: info.get("info")
      };
    })(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    expect(getInputValue(target.find("input").at(3))).toEqual(infoState.info);
    const {
      mutations: { changeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    changeName();
    expect(getInputValue(target.find("input").at(0))).toEqual(newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newAge);
    expect(getInputValue(target.find("input").at(3))).toEqual(newInfo);
    expect(renderCount).toEqual(2);
  });

  it("component connct more model && syncMutation of A-model setTimeout deep invoking syncMutation of B-model && render 3", async () => {
    jest.useFakeTimers();
    const model = "user";
    const info = "info";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    const infoState = {
      info: "lugiax-admin"
    };
    const newName = "he";
    const newPwd = "admin11";
    const newAge = "2";
    const newInfo = "lugiax-web";
    const infoModel = lugiax.register({
      model: info,
      state: infoState,
      mutations: {
        sync: {
          changeInfo(data: Object, inParam: Object, { mutations }) {
            return data.set("info", newInfo);
          }
        },
        async: {
          async changeInfo(data: Object, inParam: Object, { mutations }) {
            return data.set("info", newInfo);
          }
        }
      }
    });
    const {
      mutations: { changeInfo }
    } = infoModel;
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {
          changePwd(data: Object, inParam: Object, { mutations }) {
            data = mutations.changeAge({ age: newAge });
            setTimeout(() => {
              changeInfo();
            });
            return data.set("pwd", inParam.pwd);
          },
          changeName(data: Object, inParam: Object, { mutations }) {
            data = mutations.changePwd({ pwd: newPwd });
            return data.set("name", newName);
          },
          changeAge(data: Object, inParam: Object) {
            return data.set("age", inParam.age);
          }
        },
        async: {}
      }
    });

    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.changeName({ name });
      };

      render() {
        renderCount++;
        const { name, pwd, age, info } = this.props;
        return [
          <input value={name} />,
          <input value={pwd} />,
          <input value={age} />,
          <input value={info} />
        ];
      }
    }
    const MyInput = connect([userModel, infoModel], (state: Object) => {
      const [user, info] = state;
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        age: user.get("age"),
        info: info.get("info")
      };
    })(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    expect(getInputValue(target.find("input").at(3))).toEqual(infoState.info);
    const {
      mutations: { changeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    changeName();
    jest.runAllTimers();
    expect(getInputValue(target.find("input").at(0))).toEqual(newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newAge);
    expect(getInputValue(target.find("input").at(3))).toEqual(newInfo);
    expect(renderCount).toEqual(3);
  });

  it("component connct more model && asyncMutation of A-model deep invoking asyncMutation of B-model && render 2", async () => {
    const model = "user";
    const info = "info";
    const state = {
      name: "lugiax",
      pwd: "admin",
      age: "1"
    };
    const infoState = {
      info: "lugiax-admin"
    };

    const newName = "he";
    const newPwd = "admin11";
    const newAge = "2";
    const newInfo = "lugiax-web";
    const infoModel = lugiax.register({
      model: info,
      state: infoState,
      mutations: {
        sync: {
          changeInfo(data: Object, inParam: Object, { mutations }) {
            return data.set("info", newInfo);
          }
        },
        async: {
          async changeInfo(data: Object, inParam: Object, { mutations }) {
            return data.set("info", newInfo);
          }
        }
      }
    });
    const {
      mutations: { asyncChangeInfo }
    } = infoModel;
    const userModel = lugiax.register({
      model,
      state,
      mutations: {
        sync: {},
        async: {
          async changePwd(data: Object, inParam: Object, { mutations }) {
            data = await mutations.asyncChangeAge({ age: newAge });
            await asyncChangeInfo();
            return data.set("pwd", inParam.pwd);
          },
          async changeName(data: Object, inParam: Object, { mutations }) {
            data = await mutations.asyncChangePwd({ pwd: newPwd });
            return data.set("name", newName);
          },
          async changeAge(data: Object, inParam: Object) {
            return data.set("age", inParam.age);
          }
        }
      }
    });

    let renderCount = 0;
    class Input extends React.Component<any, any> {
      static displayName = "MyInput";
      onClick = () => {
        this.props.changeName({ name });
      };

      render() {
        renderCount++;
        const { name, pwd, age, info } = this.props;
        return [
          <input value={name} />,
          <input value={pwd} />,
          <input value={age} />,
          <input value={info} />
        ];
      }
    }
    const MyInput = connect([userModel, infoModel], (state: Object) => {
      const [user, info] = state;
      return {
        name: user.get("name"),
        pwd: user.get("pwd"),
        age: user.get("age"),
        info: info.get("info")
      };
    })(Input);

    const target = mount(<MyInput />);
    expect(getInputValue(target.find("input").at(0))).toEqual(state.name);
    expect(getInputValue(target.find("input").at(1))).toEqual(state.pwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(state.age);
    expect(getInputValue(target.find("input").at(3))).toEqual(infoState.info);
    const {
      mutations: { asyncChangeName }
    } = userModel;
    expect(renderCount).toEqual(1);
    await asyncChangeName();
    expect(getInputValue(target.find("input").at(0))).toEqual(newName);
    expect(getInputValue(target.find("input").at(1))).toEqual(newPwd);
    expect(getInputValue(target.find("input").at(2))).toEqual(newAge);
    expect(getInputValue(target.find("input").at(3))).toEqual(newInfo);
    expect(renderCount).toEqual(2);
  });
});
