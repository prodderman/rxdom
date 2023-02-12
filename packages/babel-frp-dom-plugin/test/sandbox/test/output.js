import { template as _$template } from '@frp/runtime';
import { addEventListener as _$addEventListener } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div></div>`, 2);
const handler = () => console.log('hoisted delegated');
const templ = (() => {
  const _div = _tmpl$.cloneNode(true);
  _$addEventListener('click', asd, true);
  return _div;
})();