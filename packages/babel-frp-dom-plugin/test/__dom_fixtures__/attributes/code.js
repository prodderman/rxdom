const staticAttributes = (
  <main id="main">
    <div attr="qwerty">
      <h1 class="head">Head</h1>
      <a href={'http://www.expample.com'}>Link</a>
      <input defaultValue={42} />
    </div>
  </main>
);

const spreads = (
  <main>
    <div attr={atom} />
    <div {...attrs} />
    <div attr={atom} {...attrs} />
    <div {...attrs} attr={atom} />
    <div attr1={atom} {...attrs} attr2={atom} />
    <div {...attrs1} {...attrs2} />
  </main>
);
