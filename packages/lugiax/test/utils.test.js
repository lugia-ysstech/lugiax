/**
 *
 * create by ligx
 *
 */
import {
  combineFunction,
  combineMethodObject,
  tillMethodAttribute,
  withRef,
  isShouldRender,
} from '../src/utils';

describe('lugiax.bind', () => {
  it('combineMethodObject 1', () => {
    const res = [];
    const eventA = {
      onChange() {
        res.push('changeA');
      },
    };

    const result = combineMethodObject(eventA);
    expect(result).toEqual({ onChange: [eventA.onChange,], });
  });

  it('combineMethodObject 2', () => {
    const res = [];
    const eventA = {
      onChange() {
        res.push('changeA');
      },
    };

    const eventB = {
      onChange(v) {
        res.push('changeB' + v);
      },
    };

    const result = combineMethodObject(eventA, eventB);
    expect(result).toEqual({ onChange: [eventA.onChange, eventB.onChange,], });
  });

  it('combineMethodObject 3', () => {
    const res = [];
    const eventA = {
      onChange() {
        res.push('changeA');
      },
      number: 1,
    };

    const eventB = {
      onChange(v) {
        res.push('changeB' + v);
      },
    };
    const eventC = {
      onChange(v) {
        res.push('changeB' + v);
      },
    };

    const result = combineMethodObject(eventA, eventB, eventC);
    expect(result).toEqual({
      onChange: [eventA.onChange, eventB.onChange, eventC.onChange,],
    });
  });

  it('combineMethodObject 3 one different ', () => {
    const res = [];
    const eventA = {
      onChange() {
        res.push('changeA');
      },
    };

    const eventB = {
      onClick(v) {
        res.push('changeB' + v);
      },
    };
    const eventC = {
      onChange(v) {
        res.push('changeB' + v);
      },
    };

    const result = combineMethodObject(eventA, eventB, eventC);
    expect(result).toEqual({
      onChange: [eventA.onChange, eventC.onChange,],
      onClick: [eventB.onClick,],
    });
  });

  it('combineMethodObject 3 all different ', () => {
    const res = [];
    const eventA = {
      onInput() {
        res.push('changeA');
      },
    };

    const eventB = {
      onClick(v) {
        res.push('changeB' + v);
      },
    };
    const eventC = {
      onChange(v) {
        res.push('changeB' + v);
      },
    };

    const result = combineMethodObject(eventA, eventB, eventC);
    expect(result).toEqual({
      onInput: [eventA.onInput,],
      onChange: [eventC.onChange,],
      onClick: [eventB.onClick,],
    });
  });

  it('combineMethodObject empty ', () => {
    const result = combineMethodObject();
    expect(result).toEqual({});
  });
  it('combineMethodObject null or undefined ', () => {
    const result = combineMethodObject(null, undefined);
    expect(result).toEqual({});
  });

  it('tillMethodAttribute', () => {
    const onChange = () => {
      console.info('onChange');
    };
    const onClick = () => {
      console.info('click');
    };
    const expRes = {
      onChange: [onChange,],
      onClick: [onClick,],
    };
    expect(
      tillMethodAttribute({
        onChange,
        onClick,
        number: 1,
      })
    ).toEqual(expRes);
  });

  it('tillMethodAttribute empty', () => {
    expect(tillMethodAttribute(null)).toEqual({});
    expect(tillMethodAttribute(undefined)).toEqual({});
  });

  it('combineFunction 3', () => {
    const res = [];
    const eventA = {
      onChange(v) {
        res.push('changeA' + v);
      },
    };

    const eventB = {
      onChange(v) {
        res.push('changeB' + v);
      },
    };
    const eventC = {
      onChange(v) {
        res.push('changeC' + v);
      },
    };

    const result = combineFunction(eventA, eventB, eventC);
    result.onChange('hello');
    expect(res).toEqual(['changeAhello', 'changeBhello', 'changeChello',]);
  });
  it('combineFunction 3', () => {
    const changeRes = [];
    const clickRes = [];
    const eventA = {
      onChange(v) {
        changeRes.push('changeA' + v);
      },
    };

    const eventB = {
      onClick(v) {
        clickRes.push('onClick' + v);
      },
    };
    const eventC = {
      onChange(v) {
        changeRes.push('changeC' + v);
      },
    };

    const result = combineFunction(eventA, eventB, eventC);
    result.onChange('hello');
    expect(changeRes).toEqual(['changeAhello', 'changeChello',]);
    result.onClick('clk');
    expect(clickRes).toEqual(['onClickclk',]);
  });

  it('withRef enable true', () => {
    const self = {};
    const res = withRef(true, self);
    const cmp = { a: 123131, };
    res.ref(cmp);
    expect(self.target).toBe(cmp);
  });

  it('withRef enable false', () => {
    const self = {};
    const res = withRef(false, self);
    expect(res.ref).toBeUndefined();
    expect(Object.keys(self)).toEqual([]);
  });

  it('checking isShouldRender function  a function return true  b function return true', () => {
    function a(old, next) {
      return old === next;
    }
    function b(old, next) {
      return old === next;
    }
    expect(
      isShouldRender(a, b, {
        preState: 1,
        nextState: 1,
        preProps: 1,
        nextProps: 1,
      })
    ).toBe(true);
  });

  it('checking isShouldRender function  a function return false  b function return true', () => {
    function a(old, next) {
      return old !== next;
    }
    function b(old, next) {
      return old === next;
    }
    expect(
      isShouldRender(a, b, {
        preState: 1,
        nextState: 1,
        preProps: 1,
        nextProps: 1,
      })
    ).toBe(false);
  });

  it('checking isShouldRender function  a function return false  b function return false', () => {
    function a(old, next) {
      return old !== next;
    }
    function b(old, next) {
      return old !== next;
    }
    expect(
      isShouldRender(a, b, {
        preState: 1,
        nextState: 1,
        preProps: 1,
        nextProps: 1,
      })
    ).toBe(false);
  });

  it('checking isShouldRender function  a function is undefined  b function return true', () => {
    function b(old, next) {
      return old === next;
    }
    expect(
      isShouldRender(undefined, b, {
        preState: 1,
        nextState: 1,
        preProps: 1,
        nextProps: 1,
      })
    ).toBe(true);
  });

  it('checking isShouldRender function  a function is undefined  b function return false', () => {
    function b(old, next) {
      return old !== next;
    }
    expect(
      isShouldRender(undefined, b, {
        preState: 1,
        nextState: 1,
        preProps: 1,
        nextProps: 1,
      })
    ).toBe(false);
  });

  it('checking isShouldRender function  a function return true  b function is undefined ', () => {
    function b(old, next) {
      return old === next;
    }
    expect(
      isShouldRender(undefined, b, {
        preState: 1,
        nextState: 1,
        preProps: 1,
        nextProps: 1,
      })
    ).toBe(true);
  });

  it('checking isShouldRender function  a function return false  b function is undefined ', () => {
    function b(old, next) {
      return old !== next;
    }
    expect(
      isShouldRender(undefined, b, {
        preState: 1,
        nextState: 1,
        preProps: 1,
        nextProps: 1,
      })
    ).toBe(false);
  });

  it('checking isShouldRender function  a function is undefined b function is undefined ', () => {
    expect(
      isShouldRender(undefined, undefined, {
        preState: 1,
        nextState: 1,
        preProps: 1,
        nextProps: 1,
      })
    ).toBe(true);
  });

  it('checking isShouldRender function  a function is null b function is null ', () => {
    expect(
      isShouldRender(undefined, undefined, {
        preState: 1,
        nextState: 1,
        preProps: 1,
        nextProps: 1,
      })
    ).toBe(true);
  });
});
