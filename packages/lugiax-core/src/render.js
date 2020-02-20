/**
 *
 * create by ligx
 *
 * @flow
 */
import Subscribe from "./subscribe";
import Stack from "./stack";

const All = "@lugia/msg/All";

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

  onRender(topic: string, cb: function) {
    return this.renderEvent.subscribe(topic, cb);
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
    for (let model of nodeRednerModel) {
      this.renderEvent.trigger(model);
    }
    this.renderEvent.trigger(All);
  }
  trigger(model): void {
    this.renderEvent.trigger(model);
    this.renderEvent.trigger(All);
  }
}

export default new Render();
