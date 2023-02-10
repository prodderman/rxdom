import { template as _$template } from 'asd';
import { insert as _$insert } from 'asd';
const _tmpl$ = /*#__PURE__*/ _$template(
  `<div><!><style>div { color: red; }</style><h1>Welcome <!></h1><label>Edit:</label><input/><!></div>`,
  12
);
// const template = (
//   <div id="main">
//     <style>{"div { color: red; }"}</style>
//     <h1>Welcome</h1>
//     <label for={"entry"}>Edit:</label>
//     <input id="entry" type="text" />
//     {/* Comment Node */}
//   </div>
// );

const template2 = (() => {
  const _div = _tmpl$.cloneNode(true);
  const _expr = _div.firstChild;
  const _style = _expr.nextSibling;
  const _h = _style.nextSibling;
  const _label = _h.nextSibling;
  const _input = _label.nextSibling;
  const _expr3 = _input.nextSibling;
  _$insert(_div, expr, _expr);
  const _text$ = _h.firstChild;
  const _expr2 = _text$.nextSibling;
  _$insert(_h, expr, _expr2);
  _$insert(_div, expr, _expr3);
  return _div;
})();