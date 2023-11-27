const Component = () => {
  let ref;
  const text = Atom.new('text');

  return <div ref={ref}>{text}</div>;
};
