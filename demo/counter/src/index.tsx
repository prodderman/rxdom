import { render } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';

const root = document.getElementById('root');
const atomChild1 = Atom.new<(string | number)[]>(['child ', 'foo']);
const atomChild2 = Atom.new<(string | number)[]>(['child ', 'bar']);
const parentAtom = Atom.new(['text ', atomChild2]);
window.atomChild1 = atomChild1;
window.atomChild2 = atomChild2;
window.parentAtom = parentAtom;
const App = () => {
  return <main>{parentAtom}</main>;
};

render(<App />, root);
