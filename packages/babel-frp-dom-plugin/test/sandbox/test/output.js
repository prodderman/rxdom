import { createComponent as _$createComponent } from '@frp/runtime';
import { template as _$template } from '@frp/runtime';
const _tmpl$2 = /*#__PURE__*/ _$template(`<div>Child 2</div>`);
const _tmpl$ = /*#__PURE__*/ _$template(`<div>Child 1</div>`);
const root = document.getElementById('root');
const Child1 = ({ setFlag }) => {
  setFlag(false);
  return _tmpl$();
};
const Child2 = () => {
  return _tmpl$2();
};
const flag = Atom.new(true);
const App = () => {
  return _$createComponent(Cond, {
    if: flag,
    then: _$createComponent(Child1, {
      setFlag: flag.set,
    }),
    else: _$createComponent(Child2, {}),
  });
};
mount(_$createComponent(App, {}), root);