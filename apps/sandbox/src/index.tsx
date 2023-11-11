import { mount, withEffect, effect } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import { map } from '@frp-dom/reactive-core';
import './styles.css';

const flag = Atom.new(false);
const count = Atom.new(0);
window.flag = flag;
window.count = count;

const Child1 = () => {
  return withEffect(
    <div>Child</div>,
    effect(() => {
      console.log('Child1 mounted');
      return () => {
        console.log('Child1 unmounted');
      };
    })
  );
};

const Child2 = () => {
  return withEffect(
    <Child1 />,
    effect(() => {
      console.log('Child2 mounted');
      return () => {
        console.log('Child2 unmounted');
      };
    })
  );
};

const Child3 = () => {
  return withEffect(
    <Child2 />,
    effect(() => {
      console.log('Child3 mounted');
      return () => {
        console.log('Child3 unmounted');
      };
    })
  );
};

const root = document.getElementById('root');
mount(
  map(flag, (flag) => (flag ? <Child3 /> : 'True')),
  root
);
