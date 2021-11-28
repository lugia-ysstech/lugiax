/**
 * Copyright (c) 2018-present, YSSTech, Inc.
 *
 * @emails lugia@ysstech.com
 * @author zenjava
 */

import type { AopHandle, MutationName2Aop, MutationType, } from '@lugia/lugiax-core';

export function getAopHandle(
  type: MutationType,
  name: string,
  aopConfig: MutationName2Aop
): AopHandle {
  const mutationAop = aopConfig[type];
  if (!mutationAop) {
    return {};
  }
  return mutationAop[name] || {};
}
