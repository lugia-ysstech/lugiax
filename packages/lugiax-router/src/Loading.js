/**
 *
 * create by ligx
 *
 * @flow
 */
import React from 'react';

import styled, { css, keyframes, } from 'styled-components';

const spotLeft = keyframes`
  0% {
    transform: translateX(-40px);
    opacity: 0.3;
  }
  10% {
    transform: translateX(0);
    opacity: 1;
  }
  91% {
    transform: translateX(0);
    opacity: 1;
  }
  100% {
    transform: translateX(-40px);
    opacity: 0.3;
  }
`;

const spot = keyframes`
  10% {
    transform: scale(1);
  }
  15% {
    transform: scale(1.3);
  }
  20% {
    transform: scale(1);
  }
  80% {
    transform: scale(1);
  }
  85% {
    transform: scale(1.3);
  }
  90% {
    transform: scale(1);
  }
`;

const spot2 = keyframes`
  20% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  30% {
    transform: scale(1);
  }
  70% {
    transform: scale(1);
  }
  75% {
    transform: scale(1.3);
  }
  80% {
    transform: scale(1);
  }
`;

const spot3 = keyframes`
  30% {
    transform: scale(1);
  }
  35% {
    transform: scale(1.3);
  }
  40% {
    transform: scale(1);
  }
  60% {
    transform: scale(1);
  }
  65% {
    transform: scale(1.3);
  }
  70% {
    transform: scale(1);
  }
`;

const spotRight = keyframes`
  41% {
    transform: translateX(0);
    opacity: 1;
  }
  50% {
    transform: translateX(40px);
    opacity: 0.3;
  }
  60% {
    transform: translateX(0);
    opacity: 1;
  }
`;

export const LoadingWrap = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const TitleLoadingWrap = styled(LoadingWrap)`
  flex-direction: column;
`;

function second(time) {
  return `${time}s`;
}

function animation({ index, time, }) {
  const timeStr = second(time);
  switch (index) {
    case 1:
      return css`
        animation: ${spotLeft} cubic-bezier(0.33, -0.07, 0.07, 0.9) ${timeStr};
      `;
    case 2:
      return css`
        animation: ${spot} linear ${timeStr};
      `;
    case 3:
      return css`
        animation: ${spot2} linear ${timeStr};
      `;
    case 4:
      return css`
        animation: ${spot3} linear ${timeStr};
      `;
    case 5:
      return css`
        animation: ${spotRight} cubic-bezier(0.33, -0.07, 0.07, 0.9) ${timeStr};
      `;
    default:
      return '';
  }
}

const transform = ({ index, }) => {
  return index === 1 ? 'transform: translateX(-40px);' : 'transform: translateX(0);';
};
export const LoadingSpot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: ${({ radius, }) => radius};
  background: ${({ color, }) => color};
  margin: 0 ${({ space, }) => space}px;
  ${transform}
  ${animation}
  animation-iteration-count: infinite;
`;

export type Margin = {
  top?: number,
  bottom?: number,
  left?: number,
  right?: number,
};
export type LoadingProps = {
  color?: string, // 元素颜色 默认 #4d63ff
  time?: number, //动画间隔 单位为秒 默认为 2.5
  space?: number, // 元素间隔单位px  默认3
  radius?: string, // 圆角百分比  默认为 50%
  count?: number, // 圆球的数量 默认为 5
  title?: string, // 加载文本,默认为空
  getTitle?: () => string, // 策略话标题信息 默认为空
  fontSize?: number, // 文本标题大小,单位px 默认 16px
  fontColor?: string, // 文本颜色, 默认为color的值
};

const Title = styled.div`
  color: ${({ color, }) => color};
  font-size: ${({ fontSize, }) => fontSize}px;
`;

export default (props: LoadingProps) => {
  const {
    color = '#4d63ff',
    time = 2.5,
    space = 3,
    radius = '50%',
    count = 5,
    title: propsTitle,
    fontSize,
    getTitle,
    fontColor = color,
  } = props;

  const elements = [];
  const title = getTitle ? getTitle() : propsTitle ? propsTitle : '';
  const titleEl = title ? (
    <Title color={fontColor} fontSize={fontSize}>
      {title}
    </Title>
  ) : null;

  for (let i = 1; i <= count; i++) {
    elements.push(
      <LoadingSpot index={i} color={color} radius={radius} time={time} space={space}></LoadingSpot>
    );
    if (i === count / 2) {
      elements.push(titleEl);
    }
  }
  return <LoadingWrap>{elements}</LoadingWrap>;
};
