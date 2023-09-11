import * as Chart from "../../chart/chart.mjs"

// see also adr13.md
export function addMultiLineFocus(DOMRoot, DOMChart, lineHoverCallback, DOMElPrefix) {

  const lines = DOMRoot.querySelector("#chart1 > svg  g.bb-chart-lines")
  for(let i=0; i<lines.children.length; i++) {
    lines.children[i].style.pointerEvents="visibleStroke"		// see comment for passEventAlong()
    const focus_pa = focus.bind(this,lines.children[i])
    lines.children[i].addEventListener('mouseover', focus_pa)
    lines.children[i].addEventListener('mouseout', defocus)
    lines.children[i].addEventListener('mousemove', e=>passEventAlong(e))
  }

  function focus(svgEl,e) {
    let iAm
    svgEl.classList.forEach(e=>{
      if(e.startsWith(DOMElPrefix)) {
        iAm=e
      }
    })
    const groupFindSubstring = iAm.substring(0,iAm.indexOf("--"))
    const focusElementIds = getLineGroup(DOMRoot, groupFindSubstring)
    Chart.focus(DOMChart, focusElementIds)
    if(lineHoverCallback) {lineHoverCallback(focusElementIds)}
    passEventAlong(e)
  }

  function defocus(e) { Chart.focus(DOMChart); lineHoverCallback([]); passEventAlong(e) }

  // caveat: setting pointerEvents (to not "none") on lines enables us to handle events.
  // but the event doesn't get propagated further to elements which are visually behind/below the lines.
  // why? because the lines are not DOM children of the element handling the tooltip. they're merely drawn on top visually.
  // so, do it manually :-o
  function passEventAlong(e) {		// to the "visual parent"
    DOMRoot.querySelector(`#chart1 .bb-event-rect`).dispatchEvent( new e.constructor(e.type, e) )
  }
  
}


// input: "bb-target-EU"  output: ["EU, Non EU Citizens",    "EU, EU Citizens",    "EU, Nationals"]
export function getLineGroup(DOMRoot, groupFindSubstring) {
  const groupLines = DOMRoot.querySelectorAll(`#chart1 > svg  g.bb-chart-lines [class*=${groupFindSubstring}]`)
  const focusElementIds = []
  for(let j=0;j<groupLines.length;j++) {
    groupLines[j].children[0].children[0].classList.forEach(e=>{
      const bli = groupFindSubstring.replace("target","line")
      if(e.startsWith(bli)) {
        focusElementIds.push(e.replaceAll("--",", ").replaceAll("-"," ").replaceAll("target","line").slice(8))
      }
    })
  }
  return focusElementIds
}
