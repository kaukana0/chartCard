export function hilite(rootDOMNode, highlightIndices) {
  const texts = rootDOMNode.querySelector(`#chart2 > svg > g > g.bb-axis.bb-axis-x`).children
  for(let i=1; i<texts.length; i++) {
    const node = texts[i].childNodes[1]
    if(node) {
      if(highlightIndices.includes(i-1)) {
        node.setAttribute("font-weight","bold")
      } else {
        node.removeAttribute("font-weight")
      }
    }
  }
}
