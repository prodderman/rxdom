import { mount, withEffect, effect } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import { Cond } from '@frp-dom/condition';
import './styles.css';

const flag = Atom.new(true);
window.flag = flag;

const Child1 = () => {
  return withEffect(
    <div>Child</div>,
    effect(() => {
      console.log('Child1 mounted');
      return () => {
        console.log('Child1 unmounted');
      };
    }),
    effect(() => {
      console.log('another Child1 effect');
      return () => {
        console.log('another Child1 dispose');
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
    <div>Child 3</div>,
    effect(() => {
      console.log('Child3 mounted');
      return () => {
        console.log('Child3 unmounted');
      };
    })
  );
};

const root = document.getElementById('root');
mount(<Cond if={flag} then={<Child2 />} else={<Child3 />} />, root);
