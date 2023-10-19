import { createComponent as _$createComponent } from '@frp/runtime';
import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
import { setAttribute as _$setAttribute } from '@frp/runtime';
import { Show } from 'somewhere';
const _tmpl$10 = /*#__PURE__*/ _$template(`<span>3</span>`);
const _tmpl$9 = /*#__PURE__*/ _$template(`<span>2</span>`);
const _tmpl$8 = /*#__PURE__*/ _$template(`<span>1</span>`);
const _tmpl$7 = /*#__PURE__*/ _$template(`<div> | <!> |  |  | <!> | </div>`);
const _tmpl$6 = /*#__PURE__*/ _$template(
  `<div><!> | <!><!> | <!><!> | <!></div>`
);
const _tmpl$5 = /*#__PURE__*/ _$template(
  `<div><!> | <!> | <!> | <!> | <!> | <!></div>`
);
const _tmpl$4 = /*#__PURE__*/ _$template(`<div>From Parent</div>`);
const _tmpl$3 = /*#__PURE__*/ _$template(`<div><!><!><!></div>`);
const _tmpl$2 = /*#__PURE__*/ _$template(`<div></div>`);
const _tmpl$ = /*#__PURE__*/ _$template(`<div>Hello <!></div>`);
const Child = (props) => {
  const [s, set] = createSignal();
  return [
    (() => {
      const _div = _tmpl$(),
        _text = _div.firstChild,
        _marker = _text.nextSibling;
      _$setAttribute(_div, 'ref', props.ref);
      _$insert(_div, props.name, _marker);
      return _div;
    })(),
    (() => {
      const _div2 = _tmpl$2();
      _$setAttribute(_div2, 'ref', set);
      _$insert(_div2, props.children);
      return _div2;
    })(),
  ];
};
const template = (props) => {
  let childRef;
  const { content } = props;
  return (() => {
    const _div3 = _tmpl$3(),
      _Child = _div3.firstChild,
      _Child2 = _Child.nextSibling,
      _Context$Consumer = _Child2.nextSibling;
    _$insert(
      ctx,
      _div3,
      _$createComponent(Child, {
        get children() {
          return _tmpl$4();
        },
        name: 'John',
        ref: childRef,
        booleanProperty: true,
      }),
      _Child
    );
    _$insert(
      ctx,
      _div3,
      _$createComponent(Child, {
        get children() {
          return (() => {
            const _div5 = _tmpl$2();
            _$insert(_div5, content);
            return _div5;
          })();
        },
        name: 'Jason',
        ref: props.ref,
      }),
      _Child2
    );
    _$insert(
      ctx,
      _div3,
      _$createComponent(Context.Consumer, {
        get children() {
          return (context) => context;
        },
        ref: props.consumerRef(),
      }),
      _Context$Consumer
    );
    return _div3;
  })();
};
const template2 = _$createComponent(Child, {
  name: 'Jake',
  dynamic: state.data,
  stale: state.data,
  handleClick: clickHandler,
  'hyphen-ated': state.data,
  ref: (el) => (e = el),
});
const template3 = _$createComponent(Child, {
  get children() {
    return [_tmpl$2(), _tmpl$2(), _tmpl$2(), 'After'];
  },
});
const [s, set] = createSignal();
const template4 = _$createComponent(Child, {
  get children() {
    return _tmpl$2();
  },
  ref: set,
});
const template5 = _$createComponent(Child, {
  get children() {
    return state.dynamic;
  },
  dynamic: state.dynamic,
});

// builtIns
const template6 = _$createComponent(For, {
  get children() {
    return (item) =>
      _$createComponent(Show, {
        get children() {
          return item;
        },
        when: state.condition,
      });
  },
  each: state.list,
  fallback: _$createComponent(Loading, {}),
});
const template7 = _$createComponent(Child, {
  get children() {
    return [_tmpl$2(), state.dynamic];
  },
});
const template8 = _$createComponent(Child, {
  get children() {
    return [(item) => item, (item) => item];
  },
});
const template9 = _$createComponent(_garbage, {
  get children() {
    return 'Hi';
  },
});
const template10 = (() => {
  const _div11 = _tmpl$5(),
    _Link = _div11.firstChild,
    _text2 = _Link.nextSibling,
    _Link2 = _text2.nextSibling,
    _text3 = _Link2.nextSibling,
    _Link3 = _text3.nextSibling,
    _text4 = _Link3.nextSibling,
    _Link4 = _text4.nextSibling,
    _text5 = _Link4.nextSibling,
    _Link5 = _text5.nextSibling,
    _text6 = _Link5.nextSibling,
    _Link6 = _text6.nextSibling;
  _$insert(
    ctx,
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'new';
      },
    }),
    _Link
  );
  _$insert(
    ctx,
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'comments';
      },
    }),
    _Link2
  );
  _$insert(
    ctx,
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'show';
      },
    }),
    _Link3
  );
  _$insert(
    ctx,
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'ask';
      },
    }),
    _Link4
  );
  _$insert(
    ctx,
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'jobs';
      },
    }),
    _Link5
  );
  _$insert(
    ctx,
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'submit';
      },
    }),
    _Link6
  );
  return _div11;
})();
const template11 = (() => {
  const _div12 = _tmpl$6(),
    _Link7 = _div12.firstChild,
    _text7 = _Link7.nextSibling,
    _Link8 = _text7.nextSibling,
    _Link9 = _Link8.nextSibling,
    _text8 = _Link9.nextSibling,
    _Link10 = _text8.nextSibling,
    _Link11 = _Link10.nextSibling,
    _text9 = _Link11.nextSibling,
    _Link12 = _text9.nextSibling;
  _$insert(
    ctx,
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'new';
      },
    }),
    _Link7
  );
  _$insert(
    ctx,
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'comments';
      },
    }),
    _Link8
  );
  _$insert(
    ctx,
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'show';
      },
    }),
    _Link9
  );
  _$insert(
    ctx,
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'ask';
      },
    }),
    _Link10
  );
  _$insert(
    ctx,
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'jobs';
      },
    }),
    _Link11
  );
  _$insert(
    ctx,
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'submit';
      },
    }),
    _Link12
  );
  return _div12;
})();
const template12 = (() => {
  const _div13 = _tmpl$7(),
    _text10 = _div13.firstChild,
    _Link13 = _text10.nextSibling,
    _text11 = _Link13.nextSibling,
    _text12 = _text11.nextSibling,
    _text13 = _text12.nextSibling,
    _Link14 = _text13.nextSibling;
  _$insert(
    ctx,
    _div13,
    _$createComponent(Link, {
      get children() {
        return 'comments';
      },
    }),
    _Link13
  );
  _$insert(
    ctx,
    _div13,
    _$createComponent(Link, {
      get children() {
        return 'show';
      },
    }),
    _Link14
  );
  return _div13;
})();
class Template13 {
  render() {
    _$createComponent(Component, {
      get children() {
        return _$createComponent(Nested, {
          get children() {
            return this.content;
          },
          prop: this.data,
        });
      },
      prop: this.something,
      onClick: () => this.shouldStay,
    });
  }
}
const Template14 = _$createComponent(Component, {
  get children() {
    return data();
  },
});

// const Template15 = <Component {...props}/>

// const Template16 = <Component something={something} {...props}/>

const Template17 = _$createComponent(Pre, {
  get children() {
    return [_tmpl$8(), _tmpl$9(), _tmpl$10()];
  },
});
const Template18 = _$createComponent(Pre, {
  get children() {
    return [_tmpl$8(), _tmpl$9(), _tmpl$10()];
  },
});

// const Template19 = <Component {...s.dynamic()} />

const Template20 = _$createComponent(Component, {
  class: prop.red ? 'red' : 'green',
});
const template21 = _$createComponent(Component, {});

// const template22 = <Component passObject={{ ...a }} ></Component>

const template23 = _$createComponent(Component, {
  get children() {
    return 't' in test && 'true';
  },
  disabled: 't' in test,
});
const template24 = _$createComponent(Component, {
  get children() {
    return state.dynamic;
  },
});