mount(
  <Cond if={atom1} then={<For each={list}>{(n) => <div>{n}</div>}</For>} />,
  root
);
