/**
 *
 * create by ligx
 *
 * @flow
 */
import Subscribe from "./subscribe";


// stack

//

// 数学  逻辑是对的   结构化编程
// 二分排序    O(logN)
// 科学  证伪 命题 需求点
//  doTask   test1 test2 test3 test4 .... testN

class Stack {}

class Render {
  event: Subscribe;
  stack: Stack;
  constructor() {
    this.event = new Subscribe();
    this.stack = new Stack();
  }

  beginCall = (needRenderId: string) => {
    this.stack.push();
  };

  endCall = (needRenderId: string): void => {};

  onRender = (cb: (needRenderIds: string[]) => void) => {};
}

export default new Render();

// single   multiple

/*
  lugiax.register({

    mutations: {
      async: {
          async function f1(){
           lugiax.beginCall(modelName);
              xxx
              x
              x
              x
              xx
              return ...
           lugiax.endCall(modelName);

          }
      }
    }
  })


 */

/*

 connect  bind
lugiax.onRender(( modelNames: string[])=>{
  for model in modelNames
    if(need model){
      render
    }
})
 */

