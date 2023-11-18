import { mount, withEffect, effect } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import { map } from '@frp-dom/reactive-core';
import './styles.css';

const array = Atom.new([
  true,
  document.createElement('div'),
  [document.createElement('section'), 'text 1'],
  ' text 2',
  null,
  ' text 3',
]);
window.array = array;

const App = () => {
  return <div>Array: {array}</div>;
};

const root = document.getElementById('root');
mount(<App />, root);
