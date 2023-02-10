import { template as _$template } from '@frp/runtime';
import { createComponent as _$createComponent } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div></div>`, 2);
const template11 = _$createComponent(Comp, {
  get prop() {
    return fn.asd;
  },
  prop1: 123,
  prop2: 'asd',
  prop3: {
    a: 1,
  },
  prop4: true,
  prop5: undefined,
  prop6: null,
  prop7: expr,
  'ns:prop': 35,
  'conditional-prop': 1,
  'pro-p': '',
  get 'render-prop'() {
    return _tmpl$.cloneNode(true);
  },
  get passObject() {
    return {
      ...a,
    };
  },
});