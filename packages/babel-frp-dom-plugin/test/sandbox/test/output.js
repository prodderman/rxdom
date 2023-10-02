import { createComponent as _$createComponent } from '@frp/runtime';
import { template as _$template } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<div></div>`);
const root = document.getElementById('root');
const App = () => {
  const count = Atom.new('count', 0);
  const enough = Property.combine('a', count, (c) => c < 2);
  return [_tmpl$(), _tmpl$()];
};
render(_$createComponent(App, {}), root);