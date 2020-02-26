/**
 *
 * create by ligx
 *
 * @flow
 */
import Subscribe from './subscribe';
import Stack from './stack';

const BatchModels = 'batchModels';

class Render {
  renderEvent: Subscribe;
  renderCollector: Stack;
  willRenderModules: Object;
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
    this.clearRenderModules();
  };
  clearRenderModules() {
    this.willRenderModules = {};
  }
  autoRender(): void {
    this.trigger(this.willRenderModules);
  }
  trigger(willRenderModules: object): void {
    this.renderEvent.trigger(BatchModels, willRenderModules);
  }
}

export default new Render();
