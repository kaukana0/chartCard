// TODO: this functionality belongs to chart really, not to chartCard.
// TODO: This is project specific (even contains magic strings) - it has to be generalized. Please see also comment for setData1().
export default function drawVerticalLines(DOMRoot, highlightIndices, cols, noDatapointId) {
  const highlight = highlightIndices?highlightIndices:[]

  const node = DOMRoot.querySelector("#verticalLines")  // remove possibly already existing lines
  if(node) node.remove()

  const dots = getDots(DOMRoot)
  if(!dots) {return}

  hideDots(dots, cols, noDatapointId)

  const [neu,eu,nat] = dots

  const g = document.createElementNS("http://www.w3.org/2000/svg","g")
  g.setAttribute("id", "verticalLines")

  const offsetX = Number(6)
  const offsetY = Number(5)

  for(let i=0; i<neu.length; i++) {
    const x = getX(
      Number(neu[i].getAttribute("x")),
      Number(eu[i].getAttribute("x")),
      Number(nat[i].getAttribute("x"))
    )
    if(x<=0) {continue}

    const [ymi,yma] = getMinMax(
      neu[i].hasAttribute("opacity") ? 0 : Number(neu[i].getAttribute("y")), 
      eu [i].hasAttribute("opacity") ? 0 : Number(eu [i].getAttribute("y")), 
      nat[i].hasAttribute("opacity") ? 0 : Number(nat[i].getAttribute("y"))
    )
    
    const l = document.createElementNS("http://www.w3.org/2000/svg", "line")
    l.setAttribute("x1", x+offsetX)
    l.setAttribute("y1", ymi+offsetY)
    l.setAttribute("x2", x+offsetX)
    l.setAttribute("y2", yma+offsetY)
    l.setAttribute("style", "stroke: " + (highlight.includes(i)?"#444":"#CCC"))
    l.setAttribute("stroke-width", highlight.includes(i)?"3":"2")

    g.appendChild(l)
  }

  const out = DOMRoot.querySelector("#chart2 > svg  g.bb-chart-lines")
  out.insertAdjacentElement("afterbegin", g)	// behind the dots

  function getX(a,b,c) {	// return the first not zero, if any
    let zeros=0
    if(a===0) zeros++
    if(b===0) zeros++
    if(c===0) zeros++
    if(zeros>1) {
      return -1
    } else {
      let x = a
      if(x===0) {x=b}
      if(x===0) {x=c}
      return x
    }
  }

  function getMinMax(a,b,c) {
    a = a==0 ? (b===0?c:b) : a		// avoid 0 if possible
    b = b==0 ? (a===0?c:a) : b
    c = c==0 ? (a===0?b:a) : c

    let min=a
    let max=a

    if(b<min) {min=b}
    if(c<min) {min=c}
    if(b>max) {max=b}
    if(c>max) {max=c}

    return [min,max]
  }
}

// assume number of dots for each of the 3 series are equal
function getDots(root) {
  let retVal
  const byCitizenship = ["Citizens-of-a-non-EU-country",  "Citizens-of-another-EU-country", "Nationals"]
  const byBirth = ["Born-in-a-non-EU-country", "Born-in-another-EU-country", "Native-born"]
  function sel(bla) {return `#chart2 > svg > g > g.bb-chart > g.bb-chart-lines > g.bb-chart-line.bb-target.bb-target-${bla} > g.bb-circles > use`}

  const neu = root.querySelectorAll(sel(byCitizenship[0]))
  const eu  = root.querySelectorAll(sel(byCitizenship[1]))
  const nat = root.querySelectorAll(sel(byCitizenship[2]))
  if(neu.length===0 && eu.length===0 && nat.length===0) {
    retVal= [
      root.querySelectorAll(sel(byBirth[0])),
      root.querySelectorAll(sel(byBirth[1])),
      root.querySelectorAll(sel(byBirth[2]))
    ]
  } else {
    retVal = [neu,eu,nat]
  }

  // assume all lengths are equal
  if( neu.length!==eu.length || neu.length!==nat.length ) {
    if(neu.length===0 || eu.length===0 || nat.length===0) {
      //some of them 0 is normal
    } else {
      console.error("chartCard: dot plot unequal number of dots") // this.#id()
    }
    return
  }

  return retVal
}


// kind of a trick:
// leave them (supporting the assumption of getDots()), but make them invsible.
// for line-drawing, the invisible ones are ignored.
function hideDots(dots, cols, noDatapointId) {
  if(!dots) {return}
  const [neu,eu,nat] = dots

  for(let i=0; i<neu.length; i++) {
    if(cols[1][i+1]===noDatapointId) {neu[i].setAttribute("opacity","0")}
    if(cols[2][i+1]===noDatapointId) {eu[i].setAttribute("opacity","0")}
    if(cols[3][i+1]===noDatapointId) {nat[i].setAttribute("opacity","0")}
  }
}
