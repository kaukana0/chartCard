/*
bla={
  EU:[domel1, domel2, domel3],
  AT:[domel1, domel2, domel3],
}
for each [EU,AT], remove every domel after 2nd and then 1st,
leaving only the originally 2nd
*/
export function dedupe(legendDOMNode) {
  const x = legendDOMNode.querySelectorAll("span.bb-legend-item")
  const bla = new Map()
  x.forEach((e)=>{
    if(bla.has(e.innerText)) {
      bla.get(e.innerText).push(e)
    } else {
      bla.set(e.innerText,[e])
    }
  })

  bla.forEach((v,k)=>{
    v.splice(2).forEach(e=>e.parentElement.remove())
    if(v.length>1) {
      v[0].parentElement.remove()
    }
  })

}