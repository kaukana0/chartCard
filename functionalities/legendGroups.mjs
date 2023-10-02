export function dedupe(legendDOMNode) {
  const x = legendDOMNode.querySelectorAll("span.bb-legend-item")
  const bla = new Set()
  x.forEach((e)=>{
    if(bla.has(e.innerText)) {
      e.parentElement.remove()
    } else {
      bla.add(e.innerText)
    }
  })
}