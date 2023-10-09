import { createComponent as _$createComponent } from '@frp/runtime';
import { template as _$template } from '@frp/runtime';
import { insert as _$insert } from '@frp/runtime';
const _tmpl$ = /*#__PURE__*/ _$template(`<main></main>`);
const root = document.getElementById('root');
const atomChild1 = Atom.new(['child ', 'foo']);
const atomChild2 = Atom.new(['child ', 'bar']);
const parentAtom = Atom.new(['text ', atomChild2]);
window.atomChild1 = atomChild1;
window.atomChild2 = atomChild2;
window.parentAtom = parentAtom;
const App = () => {
  return (() => {
    const _main = _tmpl$();
    _$insert(_main, parentAtom);
    return _main;
  })();
};
render(() => _$createComponent(App, {}), root);