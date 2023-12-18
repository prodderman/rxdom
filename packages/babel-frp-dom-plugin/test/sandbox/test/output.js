import { createComponent as _$createComponent } from '@frp/runtime';
const list = _$createComponent(For, {
  each: list,
  children: (n) =>
    _$createComponent(Child2, {
      n: n,
    }),
});