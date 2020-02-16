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

  it("connect twoModel areStateEqual true", () => {
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
        areStateEqual(oldState, newState) {
          callCount++;
          return oldState.get("info").length < newState.get("info").length;
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

  it("connect twoModel areStateEqual true render twice", () => {
    const name = "ligx";
    const pwd = "helol";
    const initInfo = "ligx";

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
          callCount++;
          return oldState.get("info").length < newState.get("info").length;
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
  });

  it("connect twoModel areStateEqual false", () => {
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
        areStateEqual(oldState, newState) {
          callCount++;
          return oldState.get("info") === newState.get("info");
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

  it("connect twoModel areStateEqual false render twice", () => {
    const name = "ligx";
    const pwd = "helol";
    const initInfo = "ligx";
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
          callCount++;
          return oldState.get("info") === newState.get("info");
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
});
