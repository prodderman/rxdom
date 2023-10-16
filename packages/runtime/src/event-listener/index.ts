export function addEventListener(
  node: Node,
  name: string,
  handler: EventListenerOrEventListenerObject
) {
  node.addEventListener(name, handler);
}
