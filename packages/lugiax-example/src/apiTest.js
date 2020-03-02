/**
 *
 * create by szfeng
 *
 * @flow
 */
import React from 'react';
import { go, Link, createRoute, goBack, goForward, replace, } from '@lugia/lugiax-router';
import styled from 'styled-components';
import Data from './data';

const createPage = (id, text = id) => () => {
  console.info('render', id);
  return <h1 id={`${id}Res`}>{text}</h1>;
};
const Car = createPage('Car');
const News = createPage('News');
const Games = createPage('Games');
const NotPower = createPage('P403', '没有权限');
const NotFound = createPage('NotFound');

const CommonBotton = styled.div`
  width: 240px;
  height: 30px;
  line-height: 30px;
  background: #8b1a1a;
  color: #fff;
  margin: 5px;
  text-align: center;
  display: inline-block;
  border-radius: 5px;
  vertical-align: center;
  cursor: pointer;
  user-select: none;
`;

class Header extends React.Component {
  render() {
    return (
      <div>
        <p>
          <Link to="/sport" id="sport">
            运动
          </Link>
        </p>
        <p>
          <Link to="/car" id="car">
            汽车
          </Link>
        </p>
        <p>
          <Link to="/news" id="news">
            新闻
          </Link>
        </p>
        <p>
          <Link to="/games" id="games">
            游戏
          </Link>
        </p>{' '}
        <p>
          <Link to="/data" id="data">
            Data
          </Link>
        </p>{' '}
        <p>
          <Link to="/adffsa" id="notfound">
            NotFound
          </Link>
        </p>
      </div>
    );
  }
}

class Buttons extends React.Component {
  render() {
    return (
      <div>
        <h3>go 函数 传参 count</h3>
        <p>
          测试步骤：先依次点击以下4个链接，点击第一个button，会后退两个页面，再点击第二个button，回到当前页
        </p>
        <CommonBotton onClick={this.onGoToBackCount2Click}>go count：-2后退两次</CommonBotton>
        <CommonBotton onClick={this.onGoToForwardCount2Click}>go count：2 前进两次</CommonBotton>

        <h3>goBack 和 goForward 函数 </h3>
        <p>
          测试步骤：先依次点击以下4个链接，点击“后退一次”button数次，再点击“前进一次”button数次进行测试
        </p>
        <CommonBotton onClick={this.onGoBackClick}>goBack 后退一次</CommonBotton>

        <CommonBotton onClick={this.onGoForwardClick}>goForward 前进一次</CommonBotton>

        <h3>replace 函数 传参 url</h3>
        <p>
          测试步骤：先一次点击以下4个链接，点击
          “replace”button，跳转到"/sport"页面，然后点击“后退一次”，回到"/news"新闻页面，再点击“前进一次”button，回到当前页
        </p>
        <CommonBotton onClick={this.onReplaceClick}>replace url: /sport</CommonBotton>
        <CommonBotton onClick={this.onGoToBackCount1Click}>后退一次</CommonBotton>
        <CommonBotton onClick={this.onGoToForwardCount1Click}>前进一次</CommonBotton>
      </div>
    );
  }

  onGoToBackCount2Click = () => {
    go({ count: -2, });
  };

  onGoToForwardCount2Click = () => {
    go({ count: 2, });
  };

  onGoBackClick = () => {
    goBack();
  };

  onGoForwardClick = () => {
    goForward();
  };

  onReplaceClick = () => {
    replace({ url: '/sport', });
  };

  onGoToBackCount1Click = () => {
    go({ count: -1, });
  };

  onGoToForwardCount1Click = () => {
    go({ count: 1, });
  };
}

export default class Demo extends React.Component<any> {
  render() {
    return [
      <Buttons />,
      <Header />,
      createRoute({
        '/sport': {
          exact: true,
          onPageLoad() {
            window.sportLoad = true;
          },
          onPageUnLoad() {
            window.sportLoad = false;
          },
          render: async () => import('./Sport'),
        },

        '/car': {
          exact: true,
          component: Car,
        },
        '/news': {
          exact: true,
          component: News,
        },
        '/games': {
          exact: true,
          component: Games,
        },
        '/data': {
          exact: true,
          component: Data,
        },
        '/403': {
          exact: true,
          component: NotPower,
        },

        NotFound: {
          component: NotFound,
        },
      }),
    ];
  }
}
