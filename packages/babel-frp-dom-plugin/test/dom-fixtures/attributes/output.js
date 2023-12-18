import { spreadAttributes as _$spreadAttributes } from '@frp/runtime';
import { setStyle as _$setStyle } from '@frp/runtime';
import { setClass as _$setClass } from '@frp/runtime';
import { setAttribute as _$setAttribute } from '@frp/runtime';
import { template as _$template } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(
  `<main id="main"><div attr="qwerty"><h1 class="head">Head</h1><a href="http://www.expample.com">Link</a><input defaultValue="42"/></div></main>`
);
const _tmpl$2 = /*#__PURE__*/ _$template(
  `<main style="display:flex"><div style="display:grid;text-align:center;width:20px">Styles</div></main>`
);
const _tmpl$3 = /*#__PURE__*/ _$template(`<main><div></div></main>`);
const _tmpl$4 = /*#__PURE__*/ _$template(`<main><div>Styles</div></main>`);
const _tmpl$5 = /*#__PURE__*/ _$template(
  `<main><div></div><div></div><div></div><div></div><div></div></main>`
);
const staticAttributes = _tmpl$();
const staticStyles = _tmpl$2();
const dynamicAttributes = (context) => {
  const _main3 = _tmpl$3(),
    _div3 = _main3.firstChild;
  _$setAttribute(_div3, 'attr', atom);
  return _main3;
};
const dynamicClassNames = (context) => {
  const _main4 = _tmpl$3(),
    _div4 = _main4.firstChild;
  _$setClass(_main4, atom);
  _$setClass(_div4, atom2);
  return _main4;
};
const dynamicStylesStyles = (context) => {
  const _main5 = _tmpl$4(),
    _div5 = _main5.firstChild;
  _$setStyle(_main5, atom);
  _$setStyle(_div5, {
    display: atom,
    'text-align': 'center',
    width: '20px',
    ...rest,
  });
  return _main5;
};
const spreads = (context) => {
  const _main6 = _tmpl$5(),
    _div6 = _main6.firstChild,
    _div7 = _div6.nextSibling,
    _div8 = _div7.nextSibling,
    _div9 = _div8.nextSibling,
    _div10 = _div9.nextSibling;
  _$spreadAttributes(context, _div6, attrs);
  _$spreadAttributes(context, _div7, {
    attr: atom,
    ...attrs,
  });
  _$spreadAttributes(context, _div8, {
    ...attrs,
    attr: atom,
  });
  _$spreadAttributes(context, _div9, {
    attr1: atom,
    ...attrs,
    attr2: atom,
  });
  _$spreadAttributes(context, _div10, {
    ...attrs1,
    ...attrs2,
  });
  return _main6;
};