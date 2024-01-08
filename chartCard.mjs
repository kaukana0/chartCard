import MarkUpCode from  "./markUpCode.mjs"		// keep this file html/css free

import * as Chart from "../chart/chart.mjs"
import * as ChartGrid from "../chart/grid.mjs"
import * as ChartAxis from "../chart/axis.mjs"
import * as ChartTooltip from "../chart/tooltip.mjs"
import * as LegendGroups from "./functionalities/legendGroups.mjs"
import * as XCategoryAxis from "./functionalities/xCategoryAxis.mjs"
import * as PopUpMessage from "../../js/view/modules/popUpMessage.mjs"		// TODO: get this out of here

import "../eclLikeModal/modal.mjs"
import "../buttonX/button.mjs"

import "../../redist/html2canvas-1.4.1.js"		// TODO: esm?

import * as MultilineFocus from "./functionalities/multilineFocus.mjs"
import drawVerticalLines from "./functionalities/verticalLines.mjs"

// magic strings
const MS = {
	dimFull: {width: "380px", height: "380px"},

	shift: 25,					// in overview, no y label is shown but space is claimed by billboardjs anyway
	SVG_el_prefix: "bb-target-",
	ID_NO_DATAPOINT_COUNTRYSERIES: "",      // datapoint missing  TODO: NO! a component mustn't depend on an app! introduce a setter!
	FIRST_DIFFERENT: "EU, ",
}

// chart container display
const CCDISPLAY = Object.freeze({	CHART1:0, CHART2:1, LOADING:2, NOTAVAILALBE:3 })


export function isNarrowScreen() {
	return document.documentElement.clientWidth<995
}


// note: The card isn't aware about the slot content - it makes no assumptions (and shouldn't ever) about what it is.
class Element extends HTMLElement {

	#_isExpanded
	#_anchor
	#_tooltipExtFn1
	#_tooltipExtFn2
	#_unitShort = ""
	#_unitLong = ""
	#_srcLink1
	#_srcLink2
	#_articleLink
	#_isVisible
	#_userData				// possibility to associate some info to a card. not used by the card itself for anything.
	#_lineHoverCallback
	#_infoText
	#_decimals = 1
	#_dataAvailable = false
	#_display 				// one of CCDISPLAY


	#$(elementId) {
		return this.shadowRoot.getElementById(elementId)
	}

	#id() {return this.getAttribute("id")}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		const tmp = MarkUpCode.getHtmlTemplate(
				MarkUpCode.mainElements("No title", "No title", MS.dimFull.width, MS.dimFull.height, MS.shift)
			).cloneNode(true)
		this.shadowRoot.appendChild(tmp)
		// we need to get all the CSS' in here, because in light DOM they don't have any influence on the charts contained within
		this.shadowRoot.appendChild(MarkUpCode.getHtmlTemplate(
			// standard chart tooltip css; can be overwritten
			ChartGrid.gridCSS() + ChartAxis.axisCSS() + ChartTooltip.tooltipCSS()	+ MarkUpCode.legendCSS()
		))
		this.#_isExpanded = false
		this.setChartContainerDisplay(CCDISPLAY.LOADING)
		this.#_isVisible = true
	}

	get chart1() {
		return this.shadowRoot.getElementById("chart1")
	}

	get chart2() {
		return this.shadowRoot.getElementById("chart2")
	}

	get isExpanded() { return this.#_isExpanded}

	set anchor(val) {
		this.setAttribute("anchor",val)
	}

	set isVisible(val) {
		this.#_isVisible = val
		if(val) {
			this.style.display=""
		} else {
			this.style.display="none"
		}
	}

	set tooltipFn1(val) {this.#_tooltipExtFn1 = val}
	set tooltipFn2(val) {this.#_tooltipExtFn2 = val}
	set tooltipCSS(val) { this.shadowRoot.appendChild(MarkUpCode.getHtmlTemplate(val)) }

	set userData(val) {this.#_userData = val}
	get userData() {return this.#_userData}

	set lineHoverCallback(val) {this.#_lineHoverCallback = val}

	set decimals(val) {this.#_decimals = val}

	get chart1Displayed() {return this.#_display===CCDISPLAY.CHART1}

	connectedCallback() {
		this.#installEventHandlers()
		this.shadowRoot.getElementById("chartContainer").classList.add("shrinkOnContracted")
		// note: triggers resize immediately
		this.#installResizeObserver()
		this.setChartContainerDisplay(CCDISPLAY.CHART1)
	}

	#installEventHandlers() {
	
		this.#$("close").addEventListener("action", (ev) => {
			if(this.#_isExpanded) {
				this.contract() 
			}
			ev.stopPropagation()
		})

		this.shadowRoot.addEventListener('keydown', (ev) => {
			switch(ev.keyCode) {
				case 27:
					if(this.#_isExpanded) {	this.contract() }
					ev.stopPropagation()
					break;
				case 13:
					if(!this.#_isExpanded) {	this.expand() }
					ev.stopPropagation()
					break;
			}
		})

		this.#$("main").addEventListener("click", () => {
			if(!this.#_isExpanded) {
				this.expand(document.getElementById(this.#_anchor))
			}
		})

		this.#$("switchTo2").addEventListener("action", (ev) => {
			if(!this.chart1Displayed) {return}

			this.setChartContainerDisplay(CCDISPLAY.CHART2)
			ev.stopPropagation()
			this.shadowRoot.getElementById("legend1").style.display="none"

			const event = new Event("chartSwitched")
			event["to"] = 2
			this.dispatchEvent(event)
		})

		this.#$("switchTo1").addEventListener("action", (ev) => {
			if(this.chart1Displayed) {return}

			this.setChartContainerDisplay(CCDISPLAY.CHART1)
			ev.stopPropagation()
			this.shadowRoot.getElementById("legend1").style.display="flex"

			const event = new Event("chartSwitched")
			event["to"] = 1
			this.dispatchEvent(event)
		})

		this.#$("articleLink").addEventListener("click", (ev) => {
			window.open(this.#_articleLink,"")
			ev.stopPropagation()
		})

		this.#$("downloadLink").addEventListener("click", (ev) => {
			this.#createScreenshot()
			ev.stopPropagation()
		})

		this.#$("info").addEventListener("action", (ev) => {
			// TODO: this is a workaround. 
			// don't use a global modal (at least not in this way)
			document.getElementById("globalModal").setHeader("Information")
			document.getElementById("globalModal").setText(this.#_infoText)
			document.getElementById("globalModal").show()
			ev.stopPropagation()
		})
	}

	// TODO: get this out of here
	#createScreenshot() {

		document.querySelectorAll(".globan").forEach((e)=>e.setAttribute("data-html2canvas-ignore", ""))

		const cfg = {
			//windowWidth:"2048",	windowHeight:"1024",
			//width:"2048",	height:"1024",
			logging:false,
			onclone: function(doc) { doc.querySelectorAll("use.bb-circle").forEach(replace)	}
		}

		html2canvas(document.body, cfg).then(function(canvas) {
			const tmp = document.createElement('a')
			tmp.href = canvas.toDataURL()
			tmp.download = "Migrant-integration-and-inclusion-dashboard-screenshot.png"
			tmp.click()
			tmp.remove()
			PopUpMessage.show("Your image is now downloaded.",true,null)
		})

		const h = Number(this.shadowRoot.querySelector(".bb-event-rect").getAttribute("height"))

			// replace <use> with <circle> because for some reason, uses' color isn't considered and all dots in plot are black
		function replace(origElement) {
			const newElement = document.createElementNS("http://www.w3.org/2000/svg","circle")
			const x = Number(origElement.getAttribute("x"))
			const y = Number(origElement.getAttribute("y"))
			if(x>3 && y<h) {	// avoid unwanted dots
				newElement.setAttribute("r","6")
				newElement.setAttribute("cx", 6+x)
				newElement.setAttribute("cy", 6+y)
				newElement.setAttribute("fill","currentColor")
				newElement.style.color=origElement.style.fill
				origElement.parentNode.appendChild(newElement)
				origElement.remove()
			}
		}
	}

	#installResizeObserver() {
		this.ro = new ResizeObserver(this.#onResizeObserver.bind(this))
		this.ro.observe(this)
	}

	#onResizeObserver() {
		Chart.flush(this.chart1)
		this.#moveHeaderButtons(isNarrowScreen())

		if( isNarrowScreen() ) {
			this.shadowRoot.getElementById("chart2container").style.overflowX="scroll"
			Chart.setWidth(this.chart2, 995)
		} else {
			this.shadowRoot.getElementById("chart2container").style.overflowX="hidden"
			Chart.setWidth(this.chart2)
		}

		Chart.flush(this.chart2)
	}

	#moveHeaderButtons(toRow2) {
		const a = this.shadowRoot.getElementById("info")
		const b = this.shadowRoot.getElementById("switchTo1")
		const c = this.shadowRoot.getElementById("switchTo2")
		if(toRow2) {
			this.shadowRoot.getElementById("row2").append(a)
			this.shadowRoot.getElementById("row2").append(b)
			this.shadowRoot.getElementById("row2").append(c)
		} else {
			this.shadowRoot.getElementById("row3header").append(a)
			this.shadowRoot.getElementById("switch").append(b)
			this.shadowRoot.getElementById("switch").append(c)
		}
	}

	setChartContainerDisplay(display) {
		this.#_display = display

		const showPos=""
		const hidePos="none"

		const [c1,c2,lo,u,le] = [
			this.chart1.parentNode.style, 
			this.chart2.parentNode.style, 
			this.#$("loadingMsg").parentNode.style,
			this.#$("dataUnavailableMsg").parentNode.style,
			this.shadowRoot.getElementById("contractedLegend")
		]

		switch(display) {
			case CCDISPLAY.CHART1:
				c1.display = "flex"
				c2.display = hidePos
				lo.display = hidePos
				u.display = hidePos
				le.style.display = this.#_isExpanded ? "none" : "flex"
				break
			case CCDISPLAY.CHART2:
				c1.display = hidePos
				c2.display = "flex"
				lo.display = hidePos
				u.display = hidePos
				le.style.display = "none"
				break
			case CCDISPLAY.LOADING:
				c1.display = hidePos
				c2.display = hidePos
				lo.display = showPos
				u.display = hidePos
				le.style.display = "none"
				break
			case CCDISPLAY.NOTAVAILALBE:
				c1.display = hidePos
				c2.display = hidePos
				lo.display = hidePos
				u.display = showPos
				le.style.display = "none"
				break
			default:
				console.error("")
		}
	}

	#displayUnavailable() {
		if(this.#_dataAvailable || this.#_isExpanded) {
			const dataUnavailableDisplayed = this.#$("dataUnavailableMsg").parentNode.style.getPropertyValue("left")==="0px"
			if(dataUnavailableDisplayed) {
				this.setChartContainerDisplay(CCDISPLAY.CHART1)
			}
		} else {
			this.setChartContainerDisplay(CCDISPLAY.NOTAVAILALBE)
		}
	}

	setLegendDotColors(threeColors) {
		this.shadowRoot.getElementById("dot1").style.backgroundColor = threeColors[0]
		this.shadowRoot.getElementById("dot2").style.backgroundColor = threeColors[1]
		this.shadowRoot.getElementById("dot3").style.backgroundColor = threeColors[2]
	}

	setLegendTexts(threeTexts) {
		if(threeTexts[0]==="") {
			this.shadowRoot.getElementById("contractedLegendItem1").style.visibility = "hidden"
		} else {
			this.shadowRoot.getElementById("statLegTxt1").textContent = threeTexts[0]
		}
		if(threeTexts[1]==="") {
			this.shadowRoot.getElementById("contractedLegendItem2").style.visibility = "hidden"
		} else {
			this.shadowRoot.getElementById("statLegTxt2").textContent = threeTexts[1]
		}
		if(threeTexts[2]==="") {
			this.shadowRoot.getElementById("contractedLegendItem3").style.visibility = "hidden"
		} else {
			this.shadowRoot.getElementById("statLegTxt3").textContent = threeTexts[2]
		}
	}

	switchSrcLink(isSrcLink1) {
		this.#$("sourceLink").setAttribute("href", isSrcLink1?this.#_srcLink1:this.#_srcLink2)
		this.#$("sourceLink").setAttribute("target", "_blank")
	}

	static get observedAttributes() {
		return ["anchor", "header_c", "header_e", "subtitle_e", "subtitle_c", "right1", "right2", "unitshort", "unitlong","srclink1", "srclink2", "articlelink", "infotext", "offsety"]
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if(name==="anchor") {
			this.#_anchor = newVal
		}
		if( "header_c header_e subtitle_e subtitle_c right1 right2".includes(name) ) {
			if(this.shadowRoot.getElementById(name)) {
				this.shadowRoot.getElementById(name).innerHTML = newVal
			} else {
				console.error("chartCard: not initialized yet "+this.#id())
			}
		}
		if(name==="unitshort") {	this.#_unitShort = newVal }
		if(name==="unitlong") {	this.#_unitLong = newVal }
		if(name==="articlelink") { this.#_articleLink = newVal }
		if(name==="srclink2") { this.#_srcLink2 = newVal }
		if(name==="srclink1") {	this.#_srcLink1 = newVal }
		if(name==="infotext") { this.#_infoText = newVal }
		if(name==="offsety") { 
			this.shadowRoot.getElementById("main").style.setProperty('--offsety', newVal)
		}
		
	}

	// "%" should be directly after the number, "PPS" for instance separated by a space
	#getSuffix() {
		if(this.#_unitShort.length===1) {
			return this.#_unitShort
		} else {
			return " " + this.#_unitShort
		}
	}
	
	// TODO: refactor: A ChartCard shouldn't make assumptions about what types of charts it has.
	setData1(params, cb) {
		this.#_dataAvailable = params.cols.length > 1
		this.#displayUnavailable()
		Chart.init({
			chartDOMElementId: this.chart1,
			type: "line",
			legendDOMElementId: this.shadowRoot.getElementById("legend1"),
			legendBehaviour: "hover",
			cols: params.cols,
			palette: params.palette,
			fixColors: params.fixColors,
			seriesLabels: params.countryNamesFull,
			suffixText: this.#getSuffix(),
			tooltipFn: this.#_tooltipExtFn1,
			onFinished: () => {
				MultilineFocus.addMultiLineFocus(this.shadowRoot, this.chart1, this.#_lineHoverCallback, MS.SVG_el_prefix)
				LegendGroups.dedupe(this.#$("legend1"))
				if(cb) {cb()}
			},
			onResized: () => {
				LegendGroups.dedupe(this.#$("legend1"))
				this.#$("legend1").style.paddingLeft=""
			},
			legendFocusFn: (e)=>{ Chart.focus(this.chart1, 
				e ? MultilineFocus.getLineGroup(this.shadowRoot, MS.SVG_el_prefix+e.substring(0,2)) : e
			)},
			decimals: this.#_decimals,
			padding: -0.4,
		})
	}

	// vertically connected dot plot (VCDP)
	setData2(params, cb) {
		// dots get lost if there's no delay here ... (why billboardjs ?)
		if(isNarrowScreen()) {
			Chart.setWidth(this.chart2, 995)
			setTimeout(()=>this.#_setData2(params, cb), 350)
		} else {
			setTimeout(()=>this.#_setData2(params, cb), 250)
		}
	}

	#_setData2(params, cb) {
		Chart.init({
			chartDOMElementId: this.chart2,
			type: "line",
			cols: params.cols,
			palette: params.palette,
			fixColors: params.fixColors,
			seriesLabels: params.countryNamesFull,
			suffixText: this.#getSuffix(),
			showLines:false,
			tooltipFn: this.#_tooltipExtFn2,
			labelEveryTick: true,
			onFinished: ()=>{
				if(this.#_isVisible && this.#_isExpanded && this.#_display===CCDISPLAY.CHART2) {
					drawVerticalLines(this.shadowRoot, params.highlightIndices, params.cols, MS.ID_NO_DATAPOINT_COUNTRYSERIES)
				}
				XCategoryAxis.hilite(this.shadowRoot, params.highlightIndices)
				if(cb) {cb()}
			},
			onResized: () => {
				drawVerticalLines(this.shadowRoot, params.highlightIndices, params.cols, MS.ID_NO_DATAPOINT_COUNTRYSERIES)
			},
			xAxisLabelBetween:false,
			decimals: this.#_decimals,
			padding: 0.0,
			firstDifferent: MS.FIRST_DIFFERENT,
			minMaxY: {min:params.meta.smallestValue, max:params.meta.biggestValue}
		})
	}

	toggleExpansion() {
		if(this.#_isExpanded) {
			this.contract()
		} else {
			this.expand()
		}
		return this.#_isExpanded
	}

	expand() {
		if(this.#_isExpanded) return

		const div = this.shadowRoot.querySelector(".main")
		const sroot = this.shadowRoot.host

		this.storedStyles = {
			chart: Object.assign({}, this.chart1.style), 
			div:Object.assign({}, div.style), 
			sroot:Object.assign({}, sroot.style)
		}


		sroot.style.position="absolute"
		sroot.style.zIndex="1"
		sroot.style.left="0px"

		div.style.display="block"
		div.style.width = "calc(100vw - 70px)"
		div.style.height = "100%"

		div.style.borderRadius=0

		this.shadowRoot.getElementById("slotContainerTop").style.display="block"
		this.shadowRoot.getElementById("slotContainerBottom").style.display="inline"
		this.shadowRoot.getElementById("slotContainerBottomLeft").style.display="flex"
		this.shadowRoot.getElementById("close").style.display="block"
		this.shadowRoot.getElementById("switchTo1").style.display=""
		this.shadowRoot.getElementById("switchTo2").style.display=""
		this.shadowRoot.getElementById("switch").style.display="margin-right:100px;"
		this.shadowRoot.getElementById("contractedLegend").style.display="none"
		this.shadowRoot.getElementById("right1").style.display="none"
		this.shadowRoot.getElementById("right2").style.display="none"
		this.shadowRoot.getElementById("bottomLine").style.display="flex"
		this.shadowRoot.getElementById("chartContainer").classList.remove("shrinkOnContracted")
		this.shadowRoot.getElementById("chartContainer").classList.add("growOnExpanded")
		this.shadowRoot.getElementById("legend1").style.display="flex"
		if(this.shadowRoot.querySelector("#chart1 > svg")) {
			this.shadowRoot.querySelector("#chart1 > svg").style.marginLeft="-20px"
			this.shadowRoot.querySelector("#chart2 > svg").style.marginLeft="-20px"
		} else {
			console.error("chartCard: no line chart "+this.#id())
		}
		this.shadowRoot.getElementById("main").classList.remove("blueBorder")
		this.shadowRoot.getElementById("main").classList.add("noMargin")
		this.shadowRoot.getElementById("info").style.display="inline"
		this.shadowRoot.getElementById("subtitle_c").style.display="none"
		this.shadowRoot.getElementById("subtitle_e").style.display="block"
		this.shadowRoot.getElementById("header_c").style.display="none"
		this.shadowRoot.getElementById("header_e").style.display="block"

		this.#_isExpanded = true

		Chart.setYLabel(this.chart1, this.#_unitLong)
		Chart.setYLabel(this.chart2, this.#_unitLong)

		Chart.flush(this.chart1)
	
		this.setChartContainerDisplay(CCDISPLAY.CHART1)

		setTimeout(()=>LegendGroups.dedupe(this.#$("legend1")), 200)
		
		const event = new Event("expanding")
		this.dispatchEvent(event)

		this.shadowRoot.getElementById("close").focus()
	}

	contract() {
		if(!this.#_isExpanded) return

		const div = this.shadowRoot.querySelector(".main")
		const sroot = this

		sroot.style.position=""
		sroot.style.zIndex=""
		sroot.style.width=""
		sroot.style.height=""

		div.style.position=""
		div.style.width=""
		div.style.height=""
		div.style.left=""
		div.style.left=""
		div.style.zIndex=""
		div.style.borderRadius=this.storedStyles.div.borderRadius
		div.scrollTop=0

		this.shadowRoot.getElementById("slotContainerTop").style.display="none"
		this.shadowRoot.getElementById("slotContainerBottom").style.display="none"
		this.shadowRoot.getElementById("slotContainerBottomLeft").style.display="none"
		this.shadowRoot.getElementById("close").style.display="none"
		this.shadowRoot.getElementById("switchTo1").style.display="none"
		this.shadowRoot.getElementById("switchTo2").style.display="none"
		this.shadowRoot.getElementById("switch").style.display="margin-right:0px;"
		this.shadowRoot.getElementById("contractedLegend").style.display="flex"
		this.shadowRoot.getElementById("right1").style.display="block"
		this.shadowRoot.getElementById("right2").style.display="block"
		this.shadowRoot.getElementById("bottomLine").style.display="none"
		this.shadowRoot.getElementById("chartContainer").classList.add("shrinkOnContracted")
		this.shadowRoot.getElementById("chartContainer").classList.remove("growOnExpanded")
		this.shadowRoot.getElementById("main").style.overflowY="hidden"
		this.shadowRoot.getElementById("legend1").style.display="none"
		if(this.shadowRoot.querySelector("#chart1 > svg")) {
			this.shadowRoot.querySelector("#chart1 > svg").style.marginLeft=`-${MS.shift}px`
		} else {
			console.error("chartCard: no dot plot chart"+this.#id())
		}
		this.shadowRoot.getElementById("main").classList.add("blueBorder")
		this.shadowRoot.getElementById("main").classList.remove("noMargin")
		this.shadowRoot.getElementById("info").style.display="none"
		this.shadowRoot.getElementById("subtitle_c").style.display="block"
		this.shadowRoot.getElementById("subtitle_e").style.display="none"
		this.shadowRoot.getElementById("header_c").style.display="block"
		this.shadowRoot.getElementById("header_e").style.display="none"

		this.#_isExpanded = false

		Chart.setYLabel(this.chart1, null)
		Chart.setYLabel(this.chart2, null)

		this.setChartContainerDisplay(CCDISPLAY.CHART1)

		const event = new Event("contracting")
		this.dispatchEvent(event)
	}

}

window.customElements.define('chart-card', Element)
