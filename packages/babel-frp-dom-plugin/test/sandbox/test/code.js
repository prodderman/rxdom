const root = document.getElementById('root');
const atomChild1 = Atom.new(['child ', 'foo']);
const atomChild2 = Atom.new(['child ', 'bar']);
const parentAtom = Atom.new(['text ', atomChild2]);
window.atomChild1 = atomChild1;
window.atomChild2 = atomChild2;
window.parentAtom = parentAtom;
const App = () => {
  return <main>{parentAtom}</main>;
};

render(() => <App />, root);
