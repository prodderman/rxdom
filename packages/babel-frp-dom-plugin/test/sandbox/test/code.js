const Component = () => {
  const text = Atom.new('text');
  return withEffect(
    <div ref={window.ref}>{text}</div>,
    effect(() => {
      console.log(window.ref);
    })
  );
};
