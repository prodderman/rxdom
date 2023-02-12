import { createComponent as _$createComponent } from '@frp/runtime';
import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
import { setAttribute as _$setAttribute } from '@frp/runtime';
import { Show } from 'somewhere';
const _tmpl$9 = /*#__PURE__*/ _$template(`<span>3</span>`, 2);
const _tmpl$8 = /*#__PURE__*/ _$template(`<span>2</span>`, 2);
const _tmpl$7 = /*#__PURE__*/ _$template(`<span>1</span>`, 2);
const _tmpl$6 = /*#__PURE__*/ _$template(`<div> | <!> |  |  | <!> | </div>`, 4);
const _tmpl$5 = /*#__PURE__*/ _$template(
  `<div><!> | <!><!> | <!><!> | </div>`,
  7
);
const _tmpl$4 = /*#__PURE__*/ _$template(
  `<div><!> | <!> | <!> | <!> | <!> | </div>`,
  7
);
const _tmpl$3 = /*#__PURE__*/ _$template(`<div>From Parent</div>`, 2);
const _tmpl$2 = /*#__PURE__*/ _$template(`<div></div>`, 2);
const _tmpl$ = /*#__PURE__*/ _$template(`<div>Hello <!></div>`, 3);
const Child = (props) => {
  const [s, set] = createSignal();
  return [
    (() => {
      const _div = _tmpl$.cloneNode(true),
        _text = _div.firstChild,
        _mark = _text.nextSibling;
      _$setAttribute(_div, 'ref', props.ref);
      _$insert(_div, props.name, _mark);
      return _div;
    })(),
    (() => {
      const _div2 = _tmpl$2.cloneNode(true);
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
    const _div3 = _tmpl$2.cloneNode(true);
    _$insert(
      _div3,
      _$createComponent(Child, {
        get children() {
          return _tmpl$3.cloneNode(true);
        },
        name: 'John',
        ref: childRef,
        booleanProperty: true,
      })
    );
    _$insert(
      _div3,
      _$createComponent(Child, {
        get children() {
          return (() => {
            const _div5 = _tmpl$2.cloneNode(true);
            _$insert(_div5, content);
            return _div5;
          })();
        },
        name: 'Jason',
        get ref() {
          return props.ref;
        },
      })
    );
    _$insert(
      _div3,
      _$createComponent(Context.Consumer, {
        get children() {
          return (context) => context;
        },
        get ref() {
          return props.consumerRef();
        },
      })
    );
    return _div3;
  })();
};
const template2 = _$createComponent(Child, {
  name: 'Jake',
  get dynamic() {
    return state.data;
  },
  get stale() {
    return state.data;
  },
  handleClick: clickHandler,
  get 'hyphen-ated'() {
    return state.data;
  },
  get ref() {
    return (el) => (e = el);
  },
});
const template3 = _$createComponent(Child, {
  get children() {
    return [
      _tmpl$2.cloneNode(true),
      _tmpl$2.cloneNode(true),
      _tmpl$2.cloneNode(true),
      'After',
    ];
  },
});
const [s, set] = createSignal();
const template4 = _$createComponent(Child, {
  get children() {
    return _tmpl$2.cloneNode(true);
  },
  ref: set,
});
const template5 = _$createComponent(Child, {
  get children() {
    return state.dynamic;
  },
  get dynamic() {
    return state.dynamic;
  },
});

// builtIns
const template6 = _$createComponent(For, {
  get children() {
    return (item) =>
      _$createComponent(Show, {
        get children() {
          return item;
        },
        get when() {
          return state.condition;
        },
      });
  },
  get each() {
    return state.list;
  },
  get fallback() {
    return _$createComponent(Loading, {});
  },
});
const template7 = _$createComponent(Child, {
  get children() {
    return [_tmpl$2.cloneNode(true), state.dynamic];
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
  const _div11 = _tmpl$4.cloneNode(true),
    _Link = _div11.firstChild,
    _text2 = _Link.nextSibling,
    _Link2 = _text2.nextSibling,
    _text3 = _Link2.nextSibling,
    _Link3 = _text3.nextSibling,
    _text4 = _Link3.nextSibling,
    _Link4 = _text4.nextSibling,
    _text5 = _Link4.nextSibling,
    _Link5 = _text5.nextSibling,
    _text6 = _Link5.nextSibling;
  _$insert(
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'new';
      },
    }),
    _Link
  );
  _$insert(
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'comments';
      },
    }),
    _Link2
  );
  _$insert(
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'show';
      },
    }),
    _Link3
  );
  _$insert(
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'ask';
      },
    }),
    _Link4
  );
  _$insert(
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'jobs';
      },
    }),
    _Link5
  );
  _$insert(
    _div11,
    _$createComponent(Link, {
      get children() {
        return 'submit';
      },
    })
  );
  return _div11;
})();
const template11 = (() => {
  const _div12 = _tmpl$5.cloneNode(true),
    _Link6 = _div12.firstChild,
    _text7 = _Link6.nextSibling,
    _Link7 = _text7.nextSibling,
    _Link8 = _Link7.nextSibling,
    _text8 = _Link8.nextSibling,
    _Link9 = _text8.nextSibling,
    _Link10 = _Link9.nextSibling,
    _text9 = _Link10.nextSibling;
  _$insert(
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'new';
      },
    }),
    _Link6
  );
  _$insert(
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'comments';
      },
    }),
    _Link7
  );
  _$insert(
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'show';
      },
    }),
    _Link8
  );
  _$insert(
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'ask';
      },
    }),
    _Link9
  );
  _$insert(
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'jobs';
      },
    }),
    _Link10
  );
  _$insert(
    _div12,
    _$createComponent(Link, {
      get children() {
        return 'submit';
      },
    })
  );
  return _div12;
})();
const template12 = (() => {
  const _div13 = _tmpl$6.cloneNode(true),
    _text10 = _div13.firstChild,
    _Link11 = _text10.nextSibling,
    _text11 = _Link11.nextSibling,
    _text12 = _text11.nextSibling,
    _text13 = _text12.nextSibling,
    _Link12 = _text13.nextSibling,
    _text14 = _Link12.nextSibling;
  _$insert(
    _div13,
    _$createComponent(Link, {
      get children() {
        return 'comments';
      },
    }),
    _Link11
  );
  _$insert(
    _div13,
    _$createComponent(Link, {
      get children() {
        return 'show';
      },
    }),
    _Link12
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
          get prop() {
            return this.data;
          },
        });
      },
      get prop() {
        return this.something;
      },
      get onClick() {
        return () => this.shouldStay;
      },
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
    return [
      _tmpl$7.cloneNode(true),
      _tmpl$8.cloneNode(true),
      _tmpl$9.cloneNode(true),
    ];
  },
});
const Template18 = _$createComponent(Pre, {
  get children() {
    return [
      _tmpl$7.cloneNode(true),
      _tmpl$8.cloneNode(true),
      _tmpl$9.cloneNode(true),
    ];
  },
});

// const Template19 = <Component {...s.dynamic()} />

const Template20 = _$createComponent(Component, {
  get class() {
    return prop.red ? 'red' : 'green';
  },
});
const template21 = _$createComponent(Component, {});

// const template22 = <Component passObject={{ ...a }} ></Component>

const template23 = _$createComponent(Component, {
  get children() {
    return 't' in test && 'true';
  },
  get disabled() {
    return 't' in test;
  },
});
const template24 = _$createComponent(Component, {
  get children() {
    return state.dynamic;
  },
});