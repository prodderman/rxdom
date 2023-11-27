import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div></div>`);
const Component = () => {
  const text = Atom.new('text');
  return withEffect(
    (context) => {
      const _div = _tmpl$();
      window.ref = _div;
      _$insert(context, _div, text);
      return _div;
    },
    effect(() => {
      console.log(window.ref);
    })
  );
};