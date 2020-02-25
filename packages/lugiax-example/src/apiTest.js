/**
 *
 * create by szfeng
 *
 * @flow
 */
import React from 'react';
import { go, Link, createRoute, goBack, goForward, replace, } from '@lugia/lugiax-router';
import styled from 'styled-components';
const Sport = () => <h1>Sport</h1>;
const Car = () => <h1>Car</h1>;
const News = () => <h1>News</h1>;
const Games = () => <h1>Games</h1>;

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
					<Link to="/sport">运动</Link>
				</p>

				<p>
					<Link to="/car">汽车</Link>
				</p>

				<p>
					<Link to="/news">新闻</Link>
				</p>

				<p>
					<Link to="/games">游戏</Link>
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
				<p>测试步骤：先依次点击以下4个链接，点击第一个button，会后退两个页面，再点击第二个button，回到当前页</p>
				<CommonBotton onClick={this.onGoToBackCount2Click}>go count：-2后退两次</CommonBotton>
				<CommonBotton onClick={this.onGoToForwardCount2Click}>go count：2 前进两次</CommonBotton>

				<h3>goBack 和 goForward 函数 </h3>
				<p>测试步骤：先依次点击以下4个链接，点击“后退一次”button数次，再点击“前进一次”button数次进行测试</p>
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
