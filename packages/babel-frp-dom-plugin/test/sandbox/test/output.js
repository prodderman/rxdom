import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
import { createComponent as _$createComponent } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div></div>`);
mount(
  _$createComponent(Cond, {
    if: atom1,
    then: _$createComponent(For, {
      each: list,
      children: (n) => (context) => {
        const _div = _tmpl$();
        _$insert(context, _div, n);
        return _div;
      },
    }),
  }),
  root
);