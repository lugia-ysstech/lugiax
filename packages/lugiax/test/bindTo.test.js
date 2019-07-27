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
import { bindTo } from "../src/";
import { getPathArray, gettor, settor } from "../src/bindTo";
import { createDeepUserModel, createUserModel, getInputValue } from "./utils";
import immutable, { getIn } from "immutable";

Enzyme.configure({ adapter: new Adapter() });

class Input extends React.Component<any, any> {
  render() {
    const { value = "" } = this.props;
    return <input {...this.props} value={value === null ? "" : value} />;
  }
}

describe("lugiax.bindTo", () => {
  beforeEach(() => {
    lugiax.clear();
  });

  it("bindTo default", () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);

    const BindInput = bindTo(userModel, "name")(Input);

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

    const instance = target
      .children()
      .at(0)
      .instance();
    instance.componentWillUnmount.call(instance);
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(thirdName);
  });

  it("bindTo Pwd to Value Props", () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);

    const BindInput = bindTo(userModel, { pwd: "value" })(Input);

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
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe(pwd);
  });
  it("bindTo Repeat", () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);

    const BindInputA = bindTo(userModel, { pwd: "value" })(Input);
    const BindInputB = bindTo(userModel, { pwd: "value" })(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInputA />;
      }
    }

    const target = mount(<App />);
    const { model } = userModel;
    expect(
      lugiax
        .getState()
        .get(model)
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe(pwd);
  });
  it("bindTo has props ", () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);

    const BindInputA = bindTo(userModel, { pwd: "value" })(Input);

    class App extends React.Component<any, any> {
      render() {
        return <BindInputA value={'hello'}/>;
      }
    }

    const target = mount(<App />);
    const { model } = userModel;
    expect(
      lugiax
        .getState()
        .get(model)
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe('hello');
  });

  it("bindTo pwd: value & name: theName ", () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);

    const BindInput = bindTo(
      userModel,
      { pwd: "value", name: "theName" },
      {
        onChange: {
          name: e => {
            return e.target.value + "is name";
          }
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
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);

    const newValue = "hello";

    target.simulate("change", { target: { value: newValue } });

    expect(getInputValue(target.find("input").at(0))).toBe(newValue);
    expect(
      lugiax
        .getState()
        .get(model)
        .get("pwd")
    ).toBe(newValue);
    expect(
      lugiax
        .getState()
        .get(model)
        .get("name")
    ).toBe(newValue + "is name");
  });
  it("bindTo pwd: value  name: theName different eventHandle", () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createUserModel(name, pwd);

    const BindInput = bindTo(
      userModel,
      { pwd: "value", name: "theName" },
      {
        onChange: {
          name: e => {
            return e.target.value + "is name";
          },
          pwd: e => {
            return e.target.value + "is value";
          }
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
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);

    const newValue = "hello";

    target.simulate("change", { target: { value: newValue } });

    expect(getInputValue(target.find("input").at(0))).toBe(
      newValue + "is value"
    );
    expect(
      lugiax
        .getState()
        .get(model)
        .get("pwd")
    ).toBe(newValue + "is value");
    expect(
      lugiax
        .getState()
        .get(model)
        .get("name")
    ).toBe(newValue + "is name");
  });

  it("bindTo pwd: value onClick & name: theName onChange age is Default", () => {
    const name = "ligx";
    const pwd = "123456";
    const age = 100;
    const userModel = createUserModel(name, pwd, age);

    const BindInput = bindTo(
      userModel,
      { pwd: "value", name: "theName", age: "theAge" },
      {
        onChange: {
          name: e => {
            return e.target.value + "is name";
          }
        },
        onClick: {
          pwd: e => {
            return e.target.value + "is value";
          }
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
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);
    expect(target.find(Input).props().theAge).toBe(age);

    const newValue = "hello";

    target.simulate("change", { target: { value: newValue } });
    expect(target.find(Input).props().theAge).toBe(newValue);
    expect(
      lugiax
        .getState()
        .get(model)
        .get("name")
    ).toBe(newValue + "is name");

    expect(
      lugiax
        .getState()
        .get(model)
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe(pwd);

    target.simulate("click", { target: { value: newValue } });

    expect(
      lugiax
        .getState()
        .get(model)
        .get("pwd")
    ).toBe(newValue + "is value");
    expect(getInputValue(target.find("input").at(0))).toBe(
      newValue + "is value"
    );
  });

  it("gettor", () => {
    const im = immutable.fromJS({ name: "hello" });
    const get = gettor(im, "name");
    expect(get()).toBe(im.get("name"));
  });

  it("gettor obj.info.name", () => {
    const im = immutable.fromJS({ info: { name: "hello" } });
    const get = gettor(im, "info.name");
    expect(get()).toBe(im.get("info").get("name"));
  });
  it("gettor obj.info[0]", () => {
    const im = immutable.fromJS({ info: [1000] });
    const get = gettor(im, "info[0]");
    expect(get()).toBe(im.get("info").get(0));
  });

  it("gettor obj.info[0]", () => {
    const data = Array(...new Array(100)).map(call, Number);
    const im = immutable.fromJS({ info: data });
    const get = gettor(im, "info[99]");
    expect(get()).toBe(im.get("info").get(99));
  });
  const call: any = Function.call;

  it("gettor obj.info[0].name", () => {
    const data = Array(...new Array(100))
      .map(call, Number)
      .map(i => ({ name: `name:${i}` }));
    const im = immutable.fromJS({ info: data });
    const get = gettor(im, "info[99].name");
    expect(get()).toBe(
      im
        .get("info")
        .get(99)
        .get("name")
    );
  });

  it("settor", () => {
    const im = immutable.fromJS({ name: "hello" });
    const newValue = "kxy";
    const set = settor(im, "name");
    const res = set(newValue);
    expect(res.get("name")).toBe(newValue);
  });

  it("settor obj.info.name", () => {
    const im = immutable.fromJS({ info: { name: "hello" } });
    const set = settor(im, "info.name");
    const newValue = "kxy";
    const res = set(newValue);
    expect(res.get("info").get("name")).toBe(newValue);
  });

  it("settor obj.info[0]", () => {
    const im = immutable.fromJS({ info: [1000] });
    const set = settor(im, "info[0]");
    const newValue = 10002;
    const res = set(newValue);
    expect(res.get("info").get(0)).toBe(newValue);
  });

  it("settor obj.info[99]", () => {
    const data = Array(...new Array(100)).map(call, Number);
    const im = immutable.fromJS({ info: data });
    const set = settor(im, "info[99]");
    const newValue = 10002;
    const res = set(newValue);
    expect(res.get("info").get(99)).toBe(newValue);
  });

  it("settor obj.info[0].name", () => {
    const data = Array(...new Array(100))
      .map(call, Number)
      .map(i => ({ name: `name:${i}` }));
    const im = immutable.fromJS({ info: data });
    const set = settor(im, "info[99].name");
    const newValue = 10002;
    const res = set(newValue);
    expect(
      res
        .get("info")
        .get(99)
        .get("name")
    ).toBe(newValue);
  });

  it("getPathArray", () => {
    expect(getPathArray("data")).toEqual(["data"]);
    expect(getPathArray("data.a.b.c")).toEqual(["data", "a", "b", "c"]);
    expect(getPathArray("data[0].a.b.c")).toEqual(["data", "0", "a", "b", "c"]);
    expect(getPathArray("data[0].a[1].b.c[3]")).toEqual([
      "data",
      "0",
      "a",
      "1",
      "b",
      "c",
      "3"
    ]);
    expect(getPathArray("data[111]")).toEqual(["data", "111"]);
  });

  it("bindTo  deep default", () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);

    const BindInput = bindTo(userModel, "form.name")(Input);

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
        .get("form")
        .get("name")
    ).toBe(name);
    expect(getInputValue(target.find("input").at(0))).toBe(name);

    const newName = "my name is ";
    target.simulate("change", { target: { value: newName } });
    expect(
      lugiax
        .getState()
        .get(model)
        .get("form")
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
        .get("form")
        .get("name")
    ).toBe(thirdName);
    expect(getInputValue(target.find("input").at(0))).toBe(thirdName);

    const instance = target
      .children()
      .at(0)
      .instance();
    instance.componentWillUnmount.call(instance);
    changeName({ name: newName });
    expect(getInputValue(target.find("input").at(0))).toBe(thirdName);
  });

  it("bindTo Pwd to Value Props for deepModel", () => {
    const name = "ligx";
    const pwd = "123456";
    const age = 15;
    const phone = ["a", "b", "c"];
    const userModel = createDeepUserModel(name, pwd, age, phone);

    const BindInput = bindTo(userModel, { "form.phone[1]": "value" })(Input);

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
        .get("form")
        .get("phone")
        .get(1)
    ).toBe(phone[1]);
    expect(getInputValue(target.find("input").at(0))).toBe(phone[1]);
  });

  it("bindTo form.phone[1] to two Props value & label for deepModel", () => {
    const name = "ligx";
    const pwd = "123456";
    const age = 15;
    const phone = ["a", "b", "c"];
    const userModel = createDeepUserModel(name, pwd, age, phone);

    const BindInput = bindTo(userModel, {
      "form.phone[1]": ["value", "label"]
    })(Input);

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
        .get("form")
        .get("phone")
        .get(1)
    ).toBe(phone[1]);
    expect(target.find(Input).props().value).toBe(phone[1]);
    expect(target.find(Input).props().label).toBe(phone[1]);
    expect(getInputValue(target.find("input").at(0))).toBe(phone[1]);
  });

  it("bindTo pwd: value  name: theName different eventHandle  for deepModel", () => {
    const name = "ligx";
    const pwd = "123456";
    const age = 15;
    const phone = ["a", "b", "c"];
    const userModel = createDeepUserModel(name, pwd, age, phone);

    const BindInput = bindTo(
      userModel,
      { "form.pwd": "value", "form.name": "theName" },
      {
        onChange: {
          "form.name": e => {
            return e.target.value + "is name";
          },
          "form.pwd": e => {
            return e.target.value + "is value";
          }
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
        .get("form")
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);

    const newValue = "hello";

    target.simulate("change", { target: { value: newValue } });

    expect(getInputValue(target.find("input").at(0))).toBe(
      newValue + "is value"
    );
    expect(
      lugiax
        .getState()
        .get(model)
        .get("form")
        .get("pwd")
    ).toBe(newValue + "is value");
    expect(
      lugiax
        .getState()
        .get(model)
        .get("form")
        .get("name")
    ).toBe(newValue + "is name");
  });

  it("bindTo pwd: value onClick & name: theName onChange age is Default   for deepModel", () => {
    const name = "ligx";
    const pwd = "123456";
    const age = 15;
    const phone = ["a", "b", "c"];
    const userModel = createDeepUserModel(name, pwd, age, phone);

    const BindInput = bindTo(
      userModel,
      {
        "form.pwd": "value",
        "form.name": "theName",
        "form.phone[1]": "thePhone"
      },
      {
        onChange: {
          "form.name": e => {
            return e.target.value + "is name";
          }
        },
        onClick: {
          "form.pwd": e => {
            return e.target.value + "is value";
          }
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
        .get("form")
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe(pwd);
    expect(target.find(Input).props().theName).toBe(name);
    expect(target.find(Input).props().thePhone).toBe(phone[1]);

    const newValue = "hello";

    target.simulate("change", { target: { value: newValue } });
    expect(target.find(Input).props().thePhone).toBe(newValue);
    expect(
      lugiax
        .getState()
        .get(model)
        .get("form")
        .get("name")
    ).toBe(newValue + "is name");

    expect(
      lugiax
        .getState()
        .get(model)
        .get("form")
        .get("pwd")
    ).toBe(pwd);
    expect(getInputValue(target.find("input").at(0))).toBe(pwd);

    target.simulate("click", { target: { value: newValue } });

    expect(
      lugiax
        .getState()
        .get(model)
        .get("form")
        .get("pwd")
    ).toBe(newValue + "is value");
    expect(getInputValue(target.find("input").at(0))).toBe(
      newValue + "is value"
    );
  });

  it("EventHandle onClick", async () => {
    const name = "ligx";
    const pwd = "123456";
    const userModel = createDeepUserModel(name, pwd);

    let MyInput = Input;
    const changePromise = new Promise(res => {
      MyInput = bindTo(
        userModel,
        {},
        {},
        {
          onClick(e) {
            res(e.target.value);
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
      MyInput = bindTo(
        userModel,
        {},
        {},
        {
          onChange(e) {
            res(e.target.value);
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
      MyInput = bindTo(
        userModel,
        {
          "form.name": "value"
        },
        {},
        {
          onChange(e) {
            res(e.target.value);
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

    target.find(Input).simulate("change", { target: { value: newName } });
    expect(getInputValue(target.find("input").at(0))).toBe(newName);
    expect(
      lugiax
        .getState()
        .get(userModel.model)
        .getIn(["form", "name"])
    ).toBe(newName);
    expect(await changePromise).toBe(newName);
    expect(await theChangeEvent).toBe(newName);
  });
});
