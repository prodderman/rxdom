import { createComponent as _$createComponent } from '@frp/runtime';
import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
import { setAttribute as _$setAttribute } from '@frp/runtime';
import { Show } from 'somewhere';
const _tmpl$10 = /*#__PURE__*/ _$template(`<span>3</span>`, 2);
const _tmpl$9 = /*#__PURE__*/ _$template(`<span>2</span>`, 2);
const _tmpl$8 = /*#__PURE__*/ _$template(`<span>1</span>`, 2);
const _tmpl$7 = /*#__PURE__*/ _$template(`<div> | <!> |  |  | <!> | </div>`, 4);
const _tmpl$6 = /*#__PURE__*/ _$template(
  `<div><!> | <!><!> | <!><!> | <!></div>`,
  8
);
const _tmpl$5 = /*#__PURE__*/ _$template(
  `<div><!> | <!> | <!> | <!> | <!> | <!></div>`,
  8
);
const _tmpl$4 = /*#__PURE__*/ _$template(`<div>From Parent</div>`, 2);
const _tmpl$3 = /*#__PURE__*/ _$template(`<div><!><!><!></div>`, 5);
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
    const _div3 = _tmpl$3.cloneNode(true),
      _Child = _div3.firstChild,
      _Child2 = _Child.nextSibling,
      _Context$Consumer = _Child2.nextSibling;
    _$createComponent(Child, {
      get children() {
        return _tmpl$4.cloneNode(true);
      },
    });
    _$createComponent(Child, {
      get children() {
        return (() => {
          const _div5 = _tmpl$2.cloneNode(true);
          _$insert(_div5, content);
          return _div5;
        })();
      },
    });
    _$createComponent(Context.Consumer, {
      get children() {
        return (context) => context;
      },
    });
    return _div3;
  })();
};
const template2 = _$createComponent(Child, {});
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
});
const template5 = _$createComponent(Child, {
  get children() {
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
      });
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
  const _div11 = _tmpl$5.cloneNode(true),
    _Link = _div11.firstChild,
    _Link2 = _Link.nextSibling,
    _Link3 = _Link2.nextSibling,
    _Link4 = _Link3.nextSibling,
    _Link5 = _Link4.nextSibling,
    _Link6 = _Link5.nextSibling;
  _$createComponent(Link, {
    get children() {
      return 'new';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'comments';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'show';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'ask';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'jobs';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'submit';
    },
  });
  return _div11;
})();
const template11 = (() => {
  const _div12 = _tmpl$6.cloneNode(true),
    _Link7 = _div12.firstChild,
    _Link8 = _Link7.nextSibling,
    _Link9 = _Link8.nextSibling,
    _Link10 = _Link9.nextSibling,
    _Link11 = _Link10.nextSibling,
    _Link12 = _Link11.nextSibling;
  _$createComponent(Link, {
    get children() {
      return 'new';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'comments';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'show';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'ask';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'jobs';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'submit';
    },
  });
  return _div12;
})();
const template12 = (() => {
  const _div13 = _tmpl$7.cloneNode(true),
    _Link13 = _div13.nextSibling,
    _Link14 = _Link13.nextSibling;
  _$createComponent(Link, {
    get children() {
      return 'comments';
    },
  });
  _$createComponent(Link, {
    get children() {
      return 'show';
    },
  });
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
        });
      },
    });
  }
}
const Template14 = _$createComponent(Component, {
  get children() {
    return data();
  },
});
const Template15 = _$createComponent(Component, {});
const Template16 = _$createComponent(Component, {});
const Template17 = _$createComponent(Pre, {
  get children() {
    return [
      _tmpl$8.cloneNode(true),
      _tmpl$9.cloneNode(true),
      _tmpl$10.cloneNode(true),
    ];
  },
});
const Template18 = _$createComponent(Pre, {
  get children() {
    return [
      _tmpl$8.cloneNode(true),
      _tmpl$9.cloneNode(true),
      _tmpl$10.cloneNode(true),
    ];
  },
});
const Template19 = _$createComponent(Component, {});
const Template20 = _$createComponent(Component, {});
const template21 = _$createComponent(Component, {});
const template22 = _$createComponent(Component, {});
const template23 = _$createComponent(Component, {
  get children() {
    return 't' in test && 'true';
  },
});
const template24 = _$createComponent(Component, {
  get children() {
    return state.dynamic;
  },
});