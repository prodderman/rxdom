import { signal } from '@frp-dom/signals';
import { render } from '@frp-dom/runtime';

const App = () => {
  const count$ = signal(0);
  return (
    <div>
      <div>Count: {count$}</div>
      <button onclick={() => count$.modify((v) => v + 1)}>+</button>
      <button onclick={() => count$.modify((v) => v - 1)}>-</button>
    </div>
  );
};

render(() => <App />, document.getElementById('root'));
