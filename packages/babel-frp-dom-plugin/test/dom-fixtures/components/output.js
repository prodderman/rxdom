import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div></div>`);
const Component = () => {
  let ref;
  const text = Atom.new('text');
  return (context) => {
    const _div = _tmpl$();
    typeof ref === 'function' ? ref(_div) : (ref.current = _div);
    _$insert(context, _div, text);
    return _div;
  };
};