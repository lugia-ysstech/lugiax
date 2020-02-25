/**
 *
 * create by ligx
 *
 * @flow
 */
import Subscribe from "./subscribe";
import Stack from "./stack";

const BatchModels = "batchModels";

class Render {
  renderEvent: Subscribe;
  RenderCollector: Stack;
  willRenderModules: Object;
  preRenderModules: Object;
  constructor() {
    this.clear();
  }

  beginCall = (needRenderId: string) => {
    this.RenderCollector.push(needRenderId);
  };

  endCall = (): void => {
    this.RenderCollector.pop();
  };

  onRender(eventName: string, cb: (needRenderIds: string[]) => void) {
    return this.renderEvent.subscribe(eventName, cb);
  }

  clear(): void {
    this.renderEvent = new Subscribe();
    this.RenderCollector = new Stack({
      pushExecuteFn: this.pushExecuteFn,
      popExecuteFn: this.popZeroExecuteFn
    });
    this.preRenderModules = {};
    this.willRenderModules = {};
  }
  pushExecuteFn = key => {
    this.willRenderModules[key] = key;
  };
  popZeroExecuteFn = () => {
    this.autoRender();
    this.clearRenderModules();
  };
  clearRenderModules() {
    this.preRenderModules = this.willRenderModules;
    this.willRenderModules = {};
  }
  autoRender(): void {
    const nodeRednerModel = Object.keys(this.willRenderModules);
    if (nodeRednerModel.length === 0) {
      return;
    }
    this.renderEvent.trigger(BatchModels, nodeRednerModel);
  }
  trigger(model): void {
    this.renderEvent.trigger(BatchModels);
  }
}

export default new Render();
