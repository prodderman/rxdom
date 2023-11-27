import { mount, withEffect, effect } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import { Cond } from '@frp-dom/condition';
import './styles.css';

const Component = () => {
  const text = Atom.new('text');
  return withEffect(
    <div ref={window.ref}>{text}</div>,
    effect(() => {
      console.log(window.ref);
    })
  );
};

const App = () => {
  const flag = Atom.new(true);
  window.flag = flag;
  return (
    <div>
      <Cond if={flag} then={<Component />} />
    </div>
  );
};

const root = document.getElementById('root');
mount(<App />, root);
