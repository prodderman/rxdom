export function template(html: string, isSVG = false): () => Element {
  let node: Node;
  const create = () => {
    const t = document.createElement('template');
    t.innerHTML = html;
    const node = isSVG
      ? t.content.firstChild!.firstChild
      : t.content.firstChild;

    if (!node) {
      throw Error(`Invalid html: ${html}`);
    }

    return node;
  };

  return () => (node ??= create()).cloneNode(true) as Element;
}
