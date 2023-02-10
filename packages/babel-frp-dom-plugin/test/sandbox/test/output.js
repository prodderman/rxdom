import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
import { setAttribute as _$setAttribute } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div><div></div></div>`, 4);
const Child = (props) => {
  return (() => {
    const _div = _tmpl$.cloneNode(true),
      _div2 = _div.firstChild;
    _$setAttribute(_div, 'class', someSignal);
    _$insert(_div2, expr);
    return _div;
  })();
};