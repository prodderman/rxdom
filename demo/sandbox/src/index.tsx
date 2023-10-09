import { render } from '@frp-dom/runtime';
import { Atom } from '@frp-dom/data';
import './styles.css';

const root = document.getElementById('root');
const count = Atom.new(0);

const App = () => {
  return (
    <main class="main">
      <div class="counter">
        <button class="decrement" onclick={() => count.modify((v) => v - 1)}>
          -
        </button>
        <div class="box">{count}</div>
        <button class="increment" onclick={() => count.modify((v) => v + 1)}>
          +
        </button>
      </div>
    </main>
  );
};

render(() => <App />, root);
