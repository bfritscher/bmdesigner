// eslint-disable-next-line
export function totalOffset(node) {
  const offsetTotal = {
    top: 0,
    left: 0,
  };
  while (node) {
    offsetTotal.top += node.offsetTop;
    offsetTotal.left += node.offsetLeft;
    // eslint-disable-next-line
    node = node.offsetParent;
  }
  return offsetTotal;
}
