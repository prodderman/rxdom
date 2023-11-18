import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div><!><span></span></div>`);
const a = (context) => {
  const _div = _tmpl$(),
    _marker = _div.firstChild,
    _span = _marker.nextSibling;
  _$insert(context, _div, atom, _marker);
  _$insert(context, _span, atom2);
  return _div;
};