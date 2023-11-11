import { createComponent as _$createComponent } from '@frp/runtime';
import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div></div>`);
map(count, (count) => (context) => {
  const _div = _tmpl$();
  _$insert(context, _div, count);
  return _div;
});
_$createComponent(Comp, {});