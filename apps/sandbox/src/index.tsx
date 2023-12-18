import { mount, withEffect, effect, JSX } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import { Cond } from '@frp-dom/condition';
import { Iterate } from '@frp-dom/enumerate';
import { Property } from '@frp-dom/reactive-core';

import './styles.css';

const atom1 = (window.atom1 = Atom.new(false));

const Child1 = ({ r }: { r: JSX.RefObject<HTMLDivElement> }) => {
  return withEffect(
    <div ref={r}>With Ref</div>,
    effect(() => {
      console.log(`Child1 mount`, r);
      if (r.current) {
        r.current.style.color = 'red';
      }
      return () => {
        console.log(`Child1 unmount`, r);
      };
    })
  );
};

const Child2 = ({ n }: { n: Property<number> }) => {
  return withEffect(
    <div>{n}</div>,
    effect(() => {
      console.log(`Child2 ${n.get()} mount`);
      return () => {
        console.log(`Child2 ${n.get()} unmount`);
      };
    })
  );
};

const App = () => {
  const ref = {};
  const dynamicGenerator = Atom.new([1, 2, 3]);

  return (
    <div>
      <button onclick={() => atom1.modify((v) => !v)}>toggle</button>
      <Child1 r={ref} />
      <Cond
        if={atom1}
        then={
          <Iterate each={dynamicGenerator}>{(n) => <Child2 n={n} />}</Iterate>
        }
      />
    </div>
  );
};

const root = document.getElementById('root');
mount(<App />, root!);
