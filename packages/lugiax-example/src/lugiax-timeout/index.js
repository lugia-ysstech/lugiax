import React from 'react';
import { connect, } from '@lugia/lugiax';
import { userModel, } from './model';
class UserList extends React.Component {
  state = { loading: false, };
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {  asyncGetPeoples, } = this.props;
    asyncGetPeoples();
  }

  render() {
    const { list, removePeopleById, asyncRemovePeopleById , asyncGetPeoples,} = this.props;
    return (
      <div>
        {list.map(item => {
          return (
            <p>
              <span>姓名：{item.name}</span>
              <span>&nbsp;年龄：{item.age}</span>
              <span>&nbsp;爱好：{item.hobby}</span>
              <span
                onClick={() => {
                  asyncRemovePeopleById(item);
                }}
              >
                &nbsp;异步删除
              </span>
              <span
                onClick={() => {
                  removePeopleById(item);
                }}
              >
                &nbsp;同步删除
              </span>
            </p>
          );
        })}
      </div>
    );
  }
}

const App = connect(
  userModel,
  state => {
    const list = state.get('peoples').toJS ? state.get('peoples').toJS() : state.get('peoples');
    return { list, };
  },
  mutations => {
    const { removePeopleById, asyncRemovePeopleById, asyncGetPeoples, } = mutations;
    return {
      removePeopleById,
      asyncRemovePeopleById,
      asyncGetPeoples,
    };
  }
)(UserList);
export default App;
