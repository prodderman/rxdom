function hoisted1() { console.log("hoisted"); }
const hoisted2 = () => console.log("hoisted delegated")

const template = (
  <div id="main">
    <button onchange={() => console.log("bound")}>Click</button>
    <button onChange={[id => console.log("bound", id)]}>Click</button>
    <button onchange={handler}>Click</button>
    <button onchange={[handler]}>Click</button>
    <button onchange={hoisted1}>Click</button>
    <button onclick={() => console.log("click")}>Click Delegated</button>
    <button onClick={[event => console.log("click", event)]}>Click Delegated</button>
    <button onClick={handler}>Click Delegated</button>
    <button onClick={[handler]}>Click Delegated</button>
    <button onClick={hoisted2}>Click Delegated</button>
    <button capture:onClick={() => console.log("listener")}>
      Click Capture
    </button>
  </div>
);
