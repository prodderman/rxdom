const root = document.getElementById('root');

const Child1 = ({ setFlag }) => {
  setFlag(false);
  return <div>Child 1</div>;
};

const Child2 = () => {
  return <div>Child 2</div>;
};

const flag = Atom.new(true);

const App = () => {
  return (
    <Cond if={flag} then={<Child1 setFlag={flag.set} />} else={<Child2 />} />
  );
};

mount(<App />, root);
