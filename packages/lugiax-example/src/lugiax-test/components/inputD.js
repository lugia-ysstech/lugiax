import React from "react";
import { bindTo } from "@lugia/lugiax";
import inputsModel from "../model";
class InputD extends React.Component<any, any> {
  static displayName = "testInput";
  render() {
    const { props } = this;
    const { value } = this.props;
    console.log("render inputD component");
    return (
      <div style={{ border: "1px solid #000" }}>
        <p style={{ textAlign: "center" }}>inputD组件</p>
        <div style={{ textAlign: "center" }}>
          inputD：
          <input {...this.props} />
        </div>
      </div>
    );
  }
}
const App = bindTo(inputsModel, "inputD", {
  onChange: {
    inputD(e) {
      console.log("inputD");
      return e.target.value;
    }
  }
})(InputD);
export default App;
