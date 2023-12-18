import { mount, withEffect, effect } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import { Cond } from '@frp-dom/condition';
import { Iterate } from '@frp-dom/enumerate';
import { Property, map } from '@frp-dom/reactive-core';
import './styles.css';

const atom1 = (window.atom1 = Atom.new(false));

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
  const generatorObject = (function* () {
    yield 1;
    yield 2;
    yield 3;
  })();

  const dynamicGenerator = Atom.new(generatorObject);

  return (
    <div>
      <button onclick={() => atom1.modify((v) => !v)}>toggle</button>

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
mount(<App />, root);
