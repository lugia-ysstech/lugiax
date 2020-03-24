// app.js
import React from 'react';
import { bindTo, } from '@lugia/lugiax';
import { mutationsIsNull, titleModel, mutationsIsUndefined, } from './model';
class InputTitle extends React.Component<any, any> {
  static displayName = 'testInput';
  render() {
    const { props, } = this;
    const { title, } = this.props;
    return (
      <div>
        <p>{title}</p>
        <div>
          title：
          <input {...this.props} value={title} />
          <input {...this.props} value={title} />
        </div>
      </div>
    );
  }
}
const App1 = bindTo(titleModel, {
  title: 'title',
  pwd: 'pwd',
})(InputTitle);

class MutationsIsNull extends React.Component<any, any> {
  static displayName = 'testInput';
  render() {
    const { props, } = this;
    const { title, } = this.props;
    return (
      <div>
        <p>{title}</p>
        <div>
          title：
          <input {...this.props} value={title} />
          <input {...this.props} value={title} />
        </div>
      </div>
    );
  }
}
const App2 = bindTo(mutationsIsNull, {
  title: 'title',
  pwd: 'pwd',
})(MutationsIsNull);

class MutationsIsUndefined extends React.Component<any, any> {
  static displayName = 'testInput';
  render() {
    const { props, } = this;
    const { title, } = this.props;
    return (
      <div>
        <p>{title}</p>
        <div>
          title：
          <input {...this.props} value={title} />
          <input {...this.props} value={title} />
        </div>
      </div>
    );
  }
}
const App3 = bindTo(mutationsIsUndefined, {
  title: 'title',
  pwd: 'pwd',
})(MutationsIsUndefined);

export default () => {
  return [<App1 />, <App2 />, <App3 />,];
};
