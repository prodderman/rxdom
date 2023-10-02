import { render } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';

const root = document.getElementById('root');
const array1 = Atom.new('array1', [1, 2, 3, 4]);
const array2 = Atom.new('array2', ['a', 'b', array1, 'c', 'd']);
window.atom1 = array1;
window.atom2 = array2;
const App = () => {
  return <main>{array2}</main>;
};

render(<App />, root);
