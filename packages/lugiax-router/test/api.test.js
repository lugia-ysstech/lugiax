import React from 'react';
import Enzyme, { mount, } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { createBrowserHistory, } from 'history';
import {
  createRoute,
  createApp,
  go,
  Link,
  goBack,
  goForward,
  replace,
} from '../src';
import lugiax from '@lugia/lugiax';
import { createMemoryHistory, } from 'history';
import { push, } from 'connected-react-router';
import { delay, } from '@lugia/react-test-utils';
import styled from 'styled-components';
Enzyme.configure({ adapter: new Adapter(), });

const Sport = () => <h1>Sport</h1>;
Sport.displayName = 'Sport';
const Car = () => <h1>Car</h1>;
Car.displayName = 'Car';

const News = () => <h1>News</h1>;
News.displayName = 'News';

const Games = () => <h1>Games</h1>;
Games.displayName = 'Games';

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

const GoToBackCountOneButton = styled(CommonBotton)``;
GoToBackCountOneButton.displayName = 'GoToBackCountOneButton';

const GoToForwardCountOneButton = styled(CommonBotton)``;
GoToForwardCountOneButton.displayName = 'GoToForwardCountOneButton';

const GoToBackCountTwoButton = styled(CommonBotton)``;
GoToBackCountTwoButton.displayName = 'GoToBackCountTwoButton';

const GoToForwardCountTwoButton = styled(CommonBotton)``;
GoToForwardCountTwoButton.displayName = 'GoToForwardCountTwoButton';

const GoBackButton = styled(CommonBotton)``;
GoBackButton.displayName = 'GoBackButton';

const GoForwardButton = styled(CommonBotton)``;
GoForwardButton.displayName = 'GoForwardButton';

const ReplaceButton = styled(CommonBotton)``;
ReplaceButton.displayName = 'ReplaceButton';

class Header extends React.Component {
  render() {
    return (
      <div>
        <Link to="/sport">运动</Link>

        <Link to="/car">汽车</Link>

        <Link to="/news">新闻</Link>

        <Link to="/games">游戏</Link>
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
        <GoToBackCountTwoButton onClick={this.onGoToBackCount2Click}>
          go count：-2后退两次
        </GoToBackCountTwoButton>
        <GoToForwardCountTwoButton onClick={this.onGoToForwardCount2Click}>
          go count：2 前进两次
        </GoToForwardCountTwoButton>

        <h3>goBack 和 goForward 函数 传参 count</h3>
        <p>
          测试步骤：先依次点击以下4个链接，点击“后退一次”button数次，再点击“前进一次”button数次进行测试
        </p>
        <GoBackButton onClick={this.onGoBackClick}>
          goBack 后退一次
        </GoBackButton>

        <GoForwardButton onClick={this.onGoForwardClick}>
          goForward 前进一次
        </GoForwardButton>

        <h3>replace 函数 传参 url</h3>
        <p>
          测试步骤：先一次点击以下4个链接，点击
          “replace”button，跳转到"/sport"页面，然后点击“后退一次”，回到"/news"新闻页面，再点击“前进一次”button，回到当前页
        </p>
        <ReplaceButton onClick={this.onReplaceClick}>
          replace url: /sport
        </ReplaceButton>
        <GoToBackCountOneButton onClick={this.onGoToBackCount1Click}>
          后退一次
        </GoToBackCountOneButton>
        <GoToForwardCountOneButton onClick={this.onGoToForwardCount1Click}>
          前进一次
        </GoToForwardCountOneButton>
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

class Main extends React.Component {
  render() {
    return [
      <Buttons />,
      <Header />,
      createRoute({
        '/sport': {
          exact: true,
          component: Sport,
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
      }),
    ];
  }
}

describe('go({count: -1}) 后退一次', () => {
  let cmp;
  beforeAll(() => {
    const history = createMemoryHistory();
    const App = createApp(
      {
        '/': {
          component: Main,
        },
      },
      history,
      {
        async onBeforeGo({ url, }) {
          if (url === '/nowPower') {
            await go({ url: '/403', });
            return false;
          }
          return url !== '/not';
        },
      }
    );
    cmp = mount(<App />);
  });

  it('go({count: -1}) , 后退一步, 后退到初始页面后, 后退不生效', async () => {
    clickLink(0);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(1);
    cmp.update();
    await delay(100);
    cmp.update();

    cmp
      .find('GoToBackCountOneButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/sport');

    cmp
      .find('GoToBackCountOneButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/sport');
  });

  it('go({count: 1}), 先后退一步，再前进一步，前进到最后一个页面后，前进不生效', async () => {
    clickLink(0);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(1);
    cmp.update();
    await delay(100);
    cmp.update();

    cmp
      .find('GoToBackCountOneButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/sport');

    cmp
      .find('GoToForwardCountOneButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/car');

    cmp
      .find('GoToForwardCountOneButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/car');
  });

  it('go({count: -2}), 后退两步', async () => {
    clickLink(0);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(1);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(2);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(3);
    cmp.update();
    await delay(100);
    cmp.update();

    cmp
      .find('GoToBackCountTwoButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/car');
  });

  it('go({count: 2}),先后退两步， 前进两步', async () => {
    clickLink(0);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(1);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(2);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(3);
    cmp.update();
    await delay(100);
    cmp.update();

    cmp
      .find('GoToBackCountTwoButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/car');

    cmp
      .find('GoToForwardCountTwoButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/games');
  });

  it('go({count: 2}),先后退一步， 前进两步', async () => {
    clickLink(0);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(1);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(2);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(3);
    cmp.update();
    await delay(100);
    cmp.update();

    cmp
      .find('GoToBackCountOneButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/news');

    cmp
      .find('GoToForwardCountTwoButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/games');
  });

  it('goback(),后退一步', async () => {
    clickLink(0);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(1);
    cmp.update();
    await delay(100);
    clickLink(2);
    cmp.update();
    await delay(100);

    cmp
      .find('GoBackButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/car');

    cmp
      .find('GoBackButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/sport');
  });

  it('goforward(),后退一步,再前进一步', async () => {
    clickLink(0);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(1);
    cmp.update();
    await delay(100);
    clickLink(2);
    cmp.update();
    await delay(100);
    clickLink(3);
    cmp.update();
    await delay(100);

    cmp
      .find('GoBackButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/news');

    cmp
      .find('GoForwardButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/games');

    cmp
      .find('GoForwardButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/games');
  });

  it("replace({url: 'sport'}),重新加载页面，不保存加载前的页面历史记录", async () => {
    clickLink(0);
    cmp.update();
    await delay(100);
    cmp.update();
    clickLink(1);
    cmp.update();
    await delay(100);
    clickLink(2);
    cmp.update();
    await delay(100);
    clickLink(3);
    cmp.update();
    await delay(100);

    cmp
      .find('ReplaceButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/sport');

    cmp
      .find('GoToBackCountOneButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/news');

    cmp
      .find('GoToForwardCountOneButton')
      .at(0)
      .simulate('click', {});
    cmp.update();
    await delay(100);
    cmp.update();

    checkUrl('/sport');
  });

  function clickLink(i: number) {
    const links = cmp.find(Link).find('a');
    links.at(i).simulate('click', {});
  }

  function checkUrl(url: string) {
    expect(
      lugiax
        .getState()
        .get('router')
        .get('location')
        .toJS().pathname
    ).toBe(url);
  }
});
