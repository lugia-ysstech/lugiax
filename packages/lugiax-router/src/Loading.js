/**
 *
 * create by ligx
 *
 * @flow
 */
import React, { Component, } from 'react';

import styled, { keyframes, css, } from 'styled-components';

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
  10% { transform: scale(1); }
  15% { transform: scale(1.3); }
  20% { transform: scale(1); }
  80% { transform: scale(1); }
  85% { transform: scale(1.3); }
  90% { transform: scale(1); }
`;

const spot2 = keyframes`
  20% { transform: scale(1); }
  25% { transform: scale(1.3); }
  30% { transform: scale(1); }
  70% { transform: scale(1); }
  75% { transform: scale(1.3); }
  80% { transform: scale(1); }
`;

const spot3 = keyframes`
  30% { transform: scale(1); }
  35% { transform: scale(1.3); }
  40% { transform: scale(1); }
  60% { transform: scale(1); }
  65% { transform: scale(1.3); }
  70% { transform: scale(1); }
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

export const LoadingSpot = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4d63ff;
  margin: 0 3px;
  ${({ index, }) => {
    return index === 1 ? 'transform: translateX(-40px);' : 'transform: translateX(0);';
  }}

  ${({ index, }) => {
    switch (index) {
      case 1:
        return css`
          animation: ${spotLeft} cubic-bezier(0.33, -0.07, 0.07, 0.9) 2.5s;
        `;
      case 2:
        return css`
          animation: ${spot} linear 2.5s;
        `;
      case 3:
        return css`
          animation: ${spot2} linear 2.5s;
        `;
      case 4:
        return css`
          animation: ${spot3} linear 2.5s;
        `;
      case 5:
        return css`
          animation: ${spotRight} cubic-bezier(0.33, -0.07, 0.07, 0.9) 2.5s;
        `;
      default:
        return '';
    }
  }}
  
  animation-iteration-count: infinite;
`;

const spotCountArray = [1, 2, 3, 4, 5,];
export default class Loading extends Component<any, any> {
  render() {
    return (
      <LoadingWrap>
        {spotCountArray.map(item => {
          return <LoadingSpot index={item}></LoadingSpot>;
        })}
      </LoadingWrap>
    );
  }
}
