import { setAttributes as _$setAttributes } from '@frp/runtime';
import { setAttribute as _$setAttribute } from '@frp/runtime';
import { template as _$template } from '@frp/runtime';
const _tmpl$2 = /*#__PURE__*/ _$template(
  `<main><div></div><div></div><div></div><div></div><div></div><div></div></main>`
);
const _tmpl$ = /*#__PURE__*/ _$template(
  `<main id="main"><div attr="qwerty"><h1 class="head">Head</h1><a href="http://www.expample.com">Link</a><input defaultValue="42"/></div></main>`
);
const staticAttributes = _tmpl$();
const spreads = (() => {
  const _main2 = _tmpl$2(),
    _div2 = _main2.firstChild,
    _div3 = _div2.nextSibling,
    _div4 = _div3.nextSibling,
    _div5 = _div4.nextSibling,
    _div6 = _div5.nextSibling,
    _div7 = _div6.nextSibling;
  _$setAttribute(_div2, 'attr', atom);
  _$setAttributes(_div3, attrs);
  _$setAttributes(_div4, {
    attr: atom,
    ...attrs,
  });
  _$setAttributes(_div5, {
    ...attrs,
    attr: atom,
  });
  _$setAttributes(_div6, {
    attr1: atom,
    ...attrs,
    attr2: atom,
  });
  _$setAttributes(_div7, {
    ...attrs1,
    ...attrs2,
  });
  return _main2;
})();