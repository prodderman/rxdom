// const template = (
//   <div id="main">
//     <style>{"div { color: red; }"}</style>
//     <h1>Welcome</h1>
//     <label for={"entry"}>Edit:</label>
//     <input id="entry" type="text" />
//     {/* Comment Node */}
//   </div>
// );

const template2 = (
  <div id="main">
    {expr}
    <style>{"div { color: red; }"}</style>
    <h1>Welcome {expr}</h1>
    <label for={"entry"}>Edit:</label>
    <input id="entry" type="text" />
    {/* Comment Node */}
    {expr}
  </div>
);

