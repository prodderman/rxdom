const root = document.getElementById('root');
const App = () => {
  const count = Atom.new('count', 0);
  const enough = Property.combine('a', count, (c) => c < 2);

  return (
    <>
      <div />
      <div />
    </>
  );
};

render(<App />, root);
