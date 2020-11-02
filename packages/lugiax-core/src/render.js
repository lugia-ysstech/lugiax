/**
 *
 * create by ligx
 *
 * @flow
 */
import { Subscribe } from '@lugia/lugiax-common';
import Stack from './stack';

const BatchModels = 'batchModels';

class Render {
  renderEvent: Subscribe;
  renderCollector: Stack;
  willRenderModules: Object = {};
  constructor() {
    this.clear();
  }

  beginCall = (needRenderId: string) => {
    this.renderCollector.push(needRenderId);
  };

  endCall = (): void => {
    this.renderCollector.pop();
  };

  onRender(eventName: string, cb: (needRenderIds: string[]) => void) {
    return this.renderEvent.subscribe(eventName, cb);
  }

  clear(): void {
    this.renderEvent = new Subscribe();
    this.renderCollector = new Stack({
      onPushItem: this.onAfterPush,
      onStackEmpty: this.onAfterPop,
    });
    this.willRenderModules = {};
  }
  onAfterPush = key => {
    this.willRenderModules[key] = true;
  };
  onAfterPop = () => {
    this.autoRender();
  };
  clearRenderModules() {
    this.willRenderModules = {};
  }
  autoRender(): void {
    const oldWillRenderModules = this.willRenderModules;
    this.clearRenderModules();
    this.trigger(oldWillRenderModules);
  }
  trigger(willRenderModules: object): void {
    if (!willRenderModules || Object.keys(willRenderModules).length <= 0) {
      return;
    }
    this.renderEvent.trigger(BatchModels, willRenderModules);
  }
}

export default new Render();
