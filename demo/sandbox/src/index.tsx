import { mount } from '@frp-dom/runtime';
import { Atom, combine } from '@frp-dom/data';
import './styles.css';

const root = document.getElementById('root');

const App = () => {
  const count = Atom.new(0);
  const bool = Atom.new(false);
  const width = Atom.new('200px');
  const color = Atom.new('black');
  const backgroundColor = Atom.new('red');
  const styles = { width, color, 'background-color': backgroundColor };

  return (
    <main class="main" contenteditable={bool}>
      {count}
      <button onclick={() => bool.modify((prev) => !prev)}>
        {/* TODO: Make helper for conditionals <Cond if={bool} then={...} else={...}> */}
        {combine(bool, (editable) => (editable ? 'Editable' : 'Static'))}
      </button>
      <div class="counter">
        <button class="decrement" onclick={() => count.modify((v) => v - 1)}>
          -
        </button>
        <input
          class={'box'}
          value={count}
          oninput={(e) => count.set(Number(e.currentTarget.value))}
        />
        <button class="increment" onclick={() => count.modify((v) => v + 1)}>
          +
        </button>
      </div>
      <div>
        <div style={styles}>Text</div>
        <label>
          Color:
          <input
            value={color}
            oninput={(e) => color.set(e.currentTarget.value)}
          />
        </label>
        <label>
          Width:
          <input
            value={width}
            oninput={(e) => width.set(e.currentTarget.value)}
          />
        </label>
        <label>
          Bg Color:
          <input
            value={backgroundColor}
            oninput={(e) => backgroundColor.set(e.currentTarget.value)}
          />
        </label>
      </div>
    </main>
  );
};

mount(<App />, root);
