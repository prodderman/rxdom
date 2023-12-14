import { mount, withEffect, effect } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import { Cond } from '@frp-dom/condition';
import { For } from '@frp-dom/enumerate';
import { Property, map } from '@frp-dom/reactive-core';
import './styles.css';

const atom1 = (window.atom1 = Atom.new(true));
const list = (window.list = Atom.new([1, 2, 3, 4, 5, 6]));

const Child2 = ({ n }: { n: Property<number> }) => {
  return withEffect(
    <ChildOfChild2 n={n} />,
    effect(() => {
      performance.mark('Child2 mount');
      console.log('Child2 mount');

      return () => {
        performance.mark('Child2 unmount');
        console.log('Child2 unmount');
      };
    })
  );
};

const ChildOfChild2 = ({ n }: { n: Property<number> }) => {
  return withEffect(
    <div>ChildOfChild2 with n: {n}</div>,
    effect(() => {
      performance.mark('ChildOfChild2 mount');
      console.log('ChildOfChild2 mount');

      return () => {
        performance.mark('ChildOfChild2 unmount');
        console.log('ChildOfChild2 unmount');
      };
    })
  );
};

// const App = () => {
//   return (
//     <div>
//       <button onclick={() => atom1.modify((v) => !v)}>toggle</button>
//       <Cond
//         if={atom1}
//         then={<For each={list}>{(n) => <Child2 n={n} />}</For>}
//       />
//     </div>
//   );
// };

const root = document.getElementById('root');
mount(
  map(atom1, (flag) => flag && list),
  root
);
