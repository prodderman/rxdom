const width = Atom.new('20px');
const color = Atom.new('black');
const backgroundColor = Atom.new('red');

const styles = { width, color, backgroundColor };

<div
  style={{
    ...styles,
  }}
></div>;
