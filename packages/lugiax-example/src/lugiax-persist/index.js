// app.js
import React from 'react';
import { connect, } from '@lugia/lugiax';
import { userModel, subjectModel, schoolModel, } from './model';
class UserList extends React.Component {
  state = { loading: false, };
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    const { asyncGetPeoples, asyncGetSubject, asyncGetsChoolInfo, } = this.props;
    asyncGetPeoples();
    asyncGetSubject();
    asyncGetsChoolInfo();
  }
  render() {
    const { peoples, subject, schoolInfo, } = this.props;
    return (
      <div>
        <div>
          <h2>学校信息</h2>
          <p>
            <span>&nbsp;校名：{schoolInfo.name}</span>
            <span>&nbsp;校训：{schoolInfo.schoolMotto}</span>
            <span>&nbsp;地址：{schoolInfo.address}</span>
          </p>
        </div>
        <div>
          <h2>学校专业</h2>
          <p>
            {subject.map(item => {
              return <span>【{item}】</span>;
            })}
          </p>
        </div>
        <h2>学员信息</h2>
        {peoples.map(item => {
          return (
            <p>
              <span>姓名：{item.name}</span>
              <span>&nbsp;年龄：{item.age}</span>
              <span>&nbsp;爱好：{item.hobby}</span>
            </p>
          );
        })}
      </div>
    );
  }
}
const App = connect(
  [userModel, subjectModel, schoolModel,],
  state => {
    // 绑定多个model获取state状态如下，模块状态和传入model的顺序一致
    const [userModelState, subjectModelState, schoolModelState,] = state;
    const peoples = userModelState.get('peoples').toJS
      ? userModelState.get('peoples').toJS()
      : userModelState.get('peoples');
    const subject = subjectModelState.get('subject').toJS
      ? subjectModelState.get('subject').toJS()
      : subjectModelState.get('subject');
    const schoolInfo = schoolModelState.get('schoolInfo').toJS
      ? schoolModelState.get('schoolInfo').toJS()
      : schoolModelState.get('schoolInfo');
    return { peoples, subject, schoolInfo, };
  },
  mutations => {
    // 绑定多个model获取mutation如下，模块mutation和传入model的顺序一致
    const [userMutation, subjectMutation, schoolMutation,] = mutations;
    return {
      asyncGetPeoples: userMutation.asyncGetPeoples,
      asyncGetSubject: subjectMutation.asyncGetSubject,
      asyncGetsChoolInfo: schoolMutation.asyncGetsChoolInfo,
    };
  }
)(UserList);
export default App;
