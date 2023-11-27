const staticAttributes = (
  <main id="main">
    <div attr="qwerty">
      <h1 class="head">Head</h1>
      <a href={'http://www.expample.com'}>Link</a>
      <input defaultValue={42} />
    </div>
  </main>
);

const staticStyles = (
  <main style="display:flex">
    <div style={{ display: 'grid', 'text-align': 'center', width: '20px' }}>
      Styles
    </div>
  </main>
);

const dynamicAttributes = (
  <main>
    <div attr={atom} />
  </main>
);

const dynamicClassNames = (
  <main class={atom}>
    <div className={atom2} />
  </main>
);

const dynamicStylesStyles = (
  <main style={atom}>
    <div
      style={{ display: atom, 'text-align': 'center', width: '20px', ...rest }}
    >
      Styles
    </div>
  </main>
);

const spreads = (
  <main>
    <div {...attrs} />
    <div attr={atom} {...attrs} />
    <div {...attrs} attr={atom} />
    <div attr1={atom} {...attrs} attr2={atom} />
    <div {...attrs1} {...attrs2} />
  </main>
);
