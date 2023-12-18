import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(
  `<section><div>with ref <!></div><!></section>`
);
const withRef = (context) => {
  const _section = _tmpl$(),
    _div = _section.firstChild,
    _marker2 = _div.nextSibling,
    _text = _div.firstChild,
    _marker = _text.nextSibling;
  typeof ref === 'function' ? ref(_section) : (ref.current = _section);
  typeof ref === 'function' ? ref(_div) : (ref.current = _div);
  _$insert(context, _div, ref, _marker);
  _$insert(context, _section, text, _marker2);
  return _section;
};