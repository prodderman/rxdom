import { template as _$template } from '@frp/runtime';
import { setAttribute as _$setAttribute } from '@frp/runtime';
import { createComponent as _$createComponent } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div></div>`, 2);
const templ = _$createComponent(Co, {
  get children() {
    return [children, 'asd'];
  },
  get prop() {
    return w.w + 1;
  },
});
const template3 = (() => {
  const _div = _tmpl$.cloneNode(true);
  _$setAttribute(_div, 'prop', asd.w);
  return _div;
})();