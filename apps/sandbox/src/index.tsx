import { mount, withEffect, effect } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import { map } from '@frp-dom/reactive-core';
import './styles.css';

const subAtom1 = Atom.new([123, 456]);
const subAtom2 = Atom.new(['asd ', subAtom1, ' zxc']);

const array = Atom.new([' text 2 ', subAtom1, ' text 3 ', subAtom2]);
window.array = array;
window.subAtom1 = subAtom1;
window.subAtom2 = subAtom2;

const App = () => {
  return <div>{array}</div>;
};

const root = document.getElementById('root');
mount(<App />, root);
