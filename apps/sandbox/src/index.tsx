import { mount, withEffect, effect } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import { Cond } from '@frp-dom/condition';
import { For } from '@frp-dom/enumerate';
import { Property, map } from '@frp-dom/reactive-core';
import './styles.css';

const atom1 = (window.atom1 = Atom.new(false));
const list = (window.list = Atom.new([1, 2, 3]));

const Child2 = ({ n }: { n: number }) => {
  return withEffect(
    <div>{n}</div>,
    effect(() => {
      return () => {
        console.log(`Child2 ${n}} unmount`);
      };
    })
  );
};

const App = () => {
  return (
    <div>
      <button onclick={() => atom1.modify((v) => !v)}>toggle</button>
      <Cond
        if={atom1}
        then={<For each={list}>{(n) => map(n, (n) => <Child2 n={n} />)}</For>}
      />
    </div>
  );
};

const root = document.getElementById('root');
mount(<App />, root);
