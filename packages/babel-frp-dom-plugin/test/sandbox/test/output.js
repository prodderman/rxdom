import { template as _$template } from '@frp/runtime';
import { setStyle as _$setStyle } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div></div>`);
const width = Atom.new('20px');
const color = Atom.new('black');
const backgroundColor = Atom.new('red');
const styles = {
  width,
  color,
  backgroundColor,
};
(() => {
  const _div = _tmpl$();
  _$setStyle(_div, {
    ...styles,
  });
  return _div;
})();