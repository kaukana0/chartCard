import MarkUpCode from  "./markUpCode.mjs"		// keep this file html/css free

import * as Chart from "../chart/chart.mjs"
import * as ChartGrid from "../chart/grid.mjs"
import * as ChartAxis from "../chart/axis.mjs"
import * as ChartTooltip from "../chart/tooltip.mjs"
import * as Legend from "../../components/chart/legend.mjs"

import "../eclLikeModal/modal.mjs"
import "../buttonX/button.mjs"

import "../../redist/html2canvas-1.4.1.js"		// TODO: esm?

import * as MultilineFocus from "./functionalities/multilineFocus.mjs"
import drawVerticalLines from "./functionalities/verticalLines.mjs"

// magic strings
const MS = {
	width: "380px",
	height: "380px",
	shift: 25,					// in overview, no y label is shown but space is claimed by billboardjs anyway
	SVG_el_prefix: "bb-target-",
	ID_NO_DATAPOINT_COUNTRYSERIES: "",      // datapoint missing  TODO: NO! a component mustn't depend on an app! introduce a setter!
}

// chart container display
const CCDISPLAY = Object.freeze({	CHART1:0, CHART2:1, LOADING:2, NOTAVAILALBE:3 })


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
	#_cardDims
	#_isVisible
	#_catchUp					// if data was set when invisible, catch up on setting data when it becomes visible
	#_userData				// possibility to associate some info to a card. not used by the card itself for anything.
	#_lineHoverCallback
	#_infoText
	#_decimals = 1
	#_dataAvailable = false

	#$(elementId) {
		return this.shadowRoot.getElementById(elementId)
	}

	#id() {return this.getAttribute("id")}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		const tmp = MarkUpCode.getHtmlTemplate(
				MarkUpCode.mainElements("No title", "No title", MS.width, MS.height, MS.shift)
			).cloneNode(true)
		this.shadowRoot.appendChild(tmp)
		// we need to get all the CSS' in here, because in light DOM they don't have any influence on the charts contained within
		this.shadowRoot.appendChild(MarkUpCode.getHtmlTemplate(
			// standard chart tooltip css; can be overwritten
			ChartGrid.gridCSS() + ChartAxis.axisCSS() + ChartTooltip.tooltipCSS()	+ MarkUpCode.legendCSS()
		))
		this.#_isExpanded = false
		this.setChartContainerDisplay(CCDISPLAY.LOADING)
		this.#_cardDims = [this.style.width, this.style.height]
		this.#_isVisible = true
		this.#_catchUp = [null,null]
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

	// billboard can't draw when display:none and moving out of doesn't always not work (e.g. if this card is used as a flex-item)
	set isVisible(val) {
		this.#_isVisible = val
		if(val) {
			this.style.width=this.#_cardDims[0]
			this.style.height=this.#_cardDims[1]
			if(this.#_catchUp[0]) {
				this.setData1(this.#_catchUp[0]) 
				this.#_catchUp[0] = null
			}
			if(this.#_catchUp[1]) {
				this.setData2(this.#_catchUp[1]) 
				this.#_catchUp[1] = null
			}
			this.style.visibility="visible"
		} else {
			this.style.visibility="hidden"
			this.style.width="0"
			this.style.height="0"
		}
	}

	set tooltipFn1(val) {this.#_tooltipExtFn1 = val}
	set tooltipFn2(val) {this.#_tooltipExtFn2 = val}
	set tooltipCSS(val) { this.shadowRoot.appendChild(MarkUpCode.getHtmlTemplate(val)) }

	set userData(val) {this.#_userData = val}
	get userData() {return this.#_userData}

	set lineHoverCallback(val) {this.#_lineHoverCallback = val}

	set decimals(val) {this.#_decimals = val}

	connectedCallback() {
		this.#$("close").addEventListener("click", (ev) => {
			if(this.#_isExpanded) {
				this.contract() 
			}
			ev.stopPropagation()
		})

		this.shadowRoot.addEventListener('keydown', (ev) => {
			if(ev.keyCode == 27) {
				if(this.#_isExpanded) {
					this.contract() 
				}
				ev.stopPropagation()
			}
		})

		this.#$("main").addEventListener("click", () => {
			if(!this.#_isExpanded) {
				this.expand(document.getElementById(this.#_anchor))
			}
		})

		this.#$("switchTo2").addEventListener("click", (ev) => {
			//setTimeout(()=>this.#showChart1(false), 500)
			this.setChartContainerDisplay(CCDISPLAY.CHART2)
			ev.stopPropagation()
			this.shadowRoot.getElementById("legend1").style.display="none"
			Legend.resetCounter("switch to 2 " + this.#id(), Chart.getUniqueId(this.chart1), 2)

			const event = new Event("chartSwitched")
			event["to"] = 2
			this.dispatchEvent(event)
		})

		this.#$("switchTo1").addEventListener("click", (ev) => {
			this.setChartContainerDisplay(CCDISPLAY.CHART1)
			ev.stopPropagation()
			this.shadowRoot.getElementById("legend1").style.display="flex"
			Legend.resetCounter("switch to 1 " + this.#id(), Chart.getUniqueId(this.chart1), 2)

			const event = new Event("chartSwitched")
			event["to"] = 1
			this.dispatchEvent(event)
		})

		this.#$("articleLink").addEventListener("click", (ev) => {
			window.open(this.#_articleLink,"")
			ev.stopPropagation()
		})

		this.#$("downloadLink").addEventListener("click", (ev) => {
			html2canvas(this.shadowRoot.getElementById("main")).then(function(canvas) {
				const createEl = document.createElement('a');
				createEl.href = canvas.toDataURL();
				createEl.download = "Migrant-integration-and-inclusion-dashboard-screenshot.png";
				createEl.click();
				createEl.remove();
			});
			ev.stopPropagation()
		})

		this.#$("info").addEventListener("click", (ev) => {
			// TODO: this is a workaround. 
			// don't use a global modal (at least not in this way) but fix the problem here that exists because in this app,
			// "fixed" is relative to a div specified in index.html, rather than the screen.
			document.getElementById("globalModal").setHeader("Information")
			document.getElementById("globalModal").setText(this.#_infoText)
			document.getElementById("globalModal").show()
			ev.stopPropagation()
		})

		this.setChartContainerDisplay(CCDISPLAY.CHART1)
	}


	// billboard can't draw when display:none, so one solution is to move it out of sight
	setChartContainerDisplay(display) {
		const showPos="0px"
		const hidePos="1000px"

		const [c1,c2,lo,u,le] = [this.chart1.parentNode.style, 
			this.chart2.parentNode.style, 
			this.#$("loadingMsg").parentNode.style,
			this.#$("dataUnavailableMsg").parentNode.style,
			this.shadowRoot.getElementById("contractedLegend")
		]

		switch(display) {
			case CCDISPLAY.CHART1:
				c1.top = showPos
				c2.top = hidePos
				lo.top = hidePos
				u.top = hidePos
				le.style.visibility = ""
				break
			case CCDISPLAY.CHART2:
				c1.top = hidePos
				c2.top = showPos
				lo.top = hidePos
				u.top = hidePos
				le.style.visibility = ""
				break
			break
			case CCDISPLAY.LOADING:
				c1.top = hidePos
				c2.top = hidePos
				lo.top = showPos
				u.top = hidePos
				le.style.visibility = "hidden"
				//this.shadowRoot.getElementById("chartContainer").classList.add("loading")
				break
			case CCDISPLAY.NOTAVAILALBE:
				c1.top = hidePos
				c2.top = hidePos
				lo.top = hidePos
				u.top = showPos
				le.style.visibility = "hidden"
				break
			default:
				console.error("")
		}
	}

	#displayUnavailable() {
		if(this.#_dataAvailable || this.#_isExpanded) {
			const dataUnavailableDisplayed = this.#$("dataUnavailableMsg").parentNode.style.getPropertyValue("top")==="0px"
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
		this.shadowRoot.getElementById("statLegTxt1").textContent = threeTexts[0]
		this.shadowRoot.getElementById("statLegTxt2").textContent = threeTexts[1]
		this.shadowRoot.getElementById("statLegTxt3").textContent = threeTexts[2]
	}

	static get observedAttributes() {
		return ["anchor", "header_c", "header_e", "subtitle_e", "subtitle_c", "right1", "right2", "unitshort", "unitlong","srclink1", "srclink2", "articlelink", "infotext"]
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
	}

	// "%" should be directly after the number, "PPS" for instance separated by a space
	#getSuffix() {
		if(this.#_unitShort.length===1) {
			return this.#_unitShort
		} else {
			return " " + this.#_unitShort
		}
	}
	
	// line chart; please take note of comment on #resize().
	// TODO: A ChartCard shouldn't make assumptions about what types of charts it has. Big refactoring neccessary for that.
	setData1(params) {
		if(!this.#_isVisible) {
			this.#_catchUp[0] = params
		} else {
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
				onFinished: ()=>setTimeout(()=>this.#resize(true, () => {
											MultilineFocus.addMultiLineFocus(this.shadowRoot, this.chart1, this.#_lineHoverCallback, MS.SVG_el_prefix)
										}),50),
				legendFocusFn: (e)=>{ Chart.focus(this.chart1, 
					e ? MultilineFocus.getLineGroup(this.shadowRoot, MS.SVG_el_prefix+e.substring(0,2)) : e
				)},
				decimals: this.#_decimals,
				padding: -0.4
			})
		}
		Legend.resetCounter("setData1 " + this.#id(), Chart.getUniqueId(this.chart1), 2)
	}

	// vertically connected dot plot (VCDP); please take note of comment on #resize().
	setData2(params) {
		if(!this.#_isVisible) {
			this.#_catchUp[1] = params
		} else {
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
				onFinished: () => setTimeout(
					()=>this.#resize(false, () => {
						drawVerticalLines(this.shadowRoot, params.highlightIndices, params.cols, MS.ID_NO_DATAPOINT_COUNTRYSERIES)
						this.hiliteXAxisEntries(params.highlightIndices)
					})
				,50),
				xAxisLabelBetween:false,
				decimals: this.#_decimals,
				padding: -0.2,
				firstDifferent: "EU, "
			})
		}
	}

	switchSrcLink(isSrcLink1) {
		this.#$("sourceLink").setAttribute("href", isSrcLink1?this.#_srcLink1:this.#_srcLink2)
		this.#$("sourceLink").setAttribute("target", "_blank")
	}

	toggleExpansion(relativeTo) {
		if(this.#_isExpanded) {
			this.contract()
		} else {
			this.expand(relativeTo)
		}
		return this.#_isExpanded
	}

	expand(relativeTo) {
		if(this.#_isExpanded) return

		const div = this.shadowRoot.querySelector(".main")
		const sroot = this

		this.storedStyles = {
			chart: Object.assign({}, this.chart1.style), 
			div:Object.assign({}, div.style), 
			sroot:Object.assign({}, sroot.style)
		}

		sroot.style.position="fixed"
		sroot.style.zIndex="1"

		//div.style.transition="width 0.8s"
		//div.style.transition="height 0.2s"
		//this.chart1.firstElementChild.style.marginLeft=""
		//console.log(this.chart1.firstElementChild)

		div.style.position="fixed"
		div.style.width="99%"
		div.style.height= window.innerHeight - relativeTo.getBoundingClientRect().bottom - window.scrollY + "px"
		div.style.top="-10px"
		div.style.left="-10px"
		div.style.borderRadius=0

		this.shadowRoot.getElementById("slotContainerTop").style.display="inline"
		this.shadowRoot.getElementById("slotContainerBottom").style.display="inline"
		this.shadowRoot.getElementById("slotContainerBottomLeft").style.display="inline"
		this.shadowRoot.getElementById("close").style.display="inline"
		this.shadowRoot.getElementById("switch").style.display="block"
		this.shadowRoot.getElementById("contractedLegend").style.display="none"
		this.shadowRoot.getElementById("right1").style.display="none"
		this.shadowRoot.getElementById("right2").style.display="none"
		this.shadowRoot.getElementById("bottomLine").style.display="grid"
		this.shadowRoot.getElementById("chartContainer").style.height="55%"
		this.shadowRoot.getElementById("legend1").style.display="flex"
		if(this.shadowRoot.querySelector("#chart1 > svg")) {
			this.shadowRoot.querySelector("#chart1 > svg").style.marginLeft="0px"
		} else {
			console.error("chartCard: no line chart "+this.#id())
		}
		this.shadowRoot.getElementById("main").classList.remove("blueBorder")
		this.shadowRoot.getElementById("info").style.display="inline"
		this.shadowRoot.getElementById("subtitle_c").style.display="none"
		this.shadowRoot.getElementById("subtitle_e").style.display="block"
		this.shadowRoot.getElementById("header_c").style.display="none"
		this.shadowRoot.getElementById("header_e").style.display="block"

		this.#_isExpanded = true

		Chart.setYLabel(this.chart1, this.#_unitLong)
		Chart.setYLabel(this.chart2, this.#_unitLong)

		Legend.resetCounter("expand " + this.#id(), Chart.getUniqueId(this.chart1))

		this.setChartContainerDisplay(CCDISPLAY.CHART1)

		// TODO: let's see if it works well w/o Promises.all (to be correct event should be fired when both resizes are done)
		this.#resize(true, () => {
			const event = new Event("expanding")
			this.dispatchEvent(event)
		})
		this.#resize(false, ()=>{})		//TODO
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
		div.style.width=MS.width
		div.style.height=MS.height
		div.style.top=""
		div.style.left=""
		div.style.zIndex=""
		div.style.borderRadius=this.storedStyles.div.borderRadius

		this.shadowRoot.getElementById("slotContainerTop").style.display="none"
		this.shadowRoot.getElementById("slotContainerBottom").style.display="none"
		this.shadowRoot.getElementById("slotContainerBottomLeft").style.display="none"
		this.shadowRoot.getElementById("close").style.display="none"
		this.shadowRoot.getElementById("switch").style.display="none"
		this.shadowRoot.getElementById("contractedLegend").style.display="flex"
		this.shadowRoot.getElementById("right1").style.display="block"
		this.shadowRoot.getElementById("right2").style.display="block"
		this.shadowRoot.getElementById("bottomLine").style.display="none"
		this.shadowRoot.getElementById("chartContainer").style.height="66%"		// when modifying this, also modify html in MarkUpCode
		this.shadowRoot.getElementById("legend1").style.display="none"
		if(this.shadowRoot.querySelector("#chart1 > svg")) {
			this.shadowRoot.querySelector("#chart1 > svg").style.marginLeft=`-${MS.shift}px`
		} else {
			console.error("chartCard: no dot plot chart"+this.#id())
		}
		this.shadowRoot.getElementById("main").classList.add("blueBorder")
		this.shadowRoot.getElementById("info").style.display="none"
		this.shadowRoot.getElementById("subtitle_c").style.display="block"
		this.shadowRoot.getElementById("subtitle_e").style.display="none"
		this.shadowRoot.getElementById("header_c").style.display="block"
		this.shadowRoot.getElementById("header_e").style.display="none"

		this.#_isExpanded = false

		Chart.setYLabel(this.chart1, null)
		Chart.setYLabel(this.chart2, null)

		Legend.resetCounter("contract"+this.#id(), Chart.getUniqueId(this.chart1))

		this.#displayUnavailable()

		// TODO: let's see if it works well w/o Promises.all
		this.#resize(true, () => {
			const event = new Event("contracting")
			this.dispatchEvent(event)
		})
		this.#resize(false)
	}


	// take care: billboard doesn't like to get fed data while resizing.
	// it might lead to CPU overload and the site not responding to user input anymore.
	#resize(firstChart, callback) {
		if(this && this.shadowRoot) {
			const r = this.shadowRoot.getElementById("chartContainer")
			if(firstChart && this.chart1) {
				const s = this.#_isExpanded ? -100 : Number(MS.shift)
				Chart.resize(this.chart1, r.clientWidth+s, r.clientHeight, callback)
			}
			if(!firstChart && this.chart2) {
				Chart.resize(this.chart2, r.clientWidth-Number(MS.shift), r.clientHeight, callback)
			}
		}
	}


	hiliteXAxisEntries(highlightIndices) {
		const texts = this.shadowRoot.querySelector(`#chart2 > svg > g > g.bb-axis.bb-axis-x`).children
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


}

window.customElements.define('chart-card', Element)
