import MarkUpCode from  "./markUpCode.mjs"		// keep this file html/css free

import * as Chart from "../chart/chart.mjs"
import * as ChartGrid from "../chart/grid.mjs"
import * as ChartAxis from "../chart/axis.mjs"
import * as ChartTooltip from "../chart/tooltip.mjs"

import "../buttonX/button.mjs"

// magic strings
const MS = {
	width: "420px",
	height: "420px",
	shift: 25					// in overview, no y label is shown but space is claimed by billboardjs anyway
}

// note: The card isn't aware about the slot content - it makes no assumptions (and shouldn't ever) about what it is.
class Element extends HTMLElement {

	#_isExpanded
	#_anchor
	#_tooltipExtFn1
	#_tooltipExtFn2
	#_yLabel
	#_srcLinkB
	#_srcLinkC
	#_articleLink

	#$(elementId) {
		return this.shadowRoot.getElementById(elementId)
	}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		const tmp = MarkUpCode.getHtmlTemplate(
				MarkUpCode.mainElements("No title", MS.width, MS.height, MS.shift)
			).cloneNode(true)
		this.shadowRoot.appendChild(tmp)
		// we need to get all the CSS' in here, because in light DOM they don't have any influence on the charts contained within
		this.shadowRoot.appendChild(MarkUpCode.getHtmlTemplate(
			// standard chart tooltip css; can be overwritten
			ChartGrid.gridCSS() + ChartAxis.axisCSS() + ChartTooltip.tooltipCSS()	+ MarkUpCode.legendCSS()
		))
		this.#_isExpanded = false
		this.indicateLoading()
	}

	get chart1() {
		return this.shadowRoot.getElementById("chart1")
	}

	get chart2() {
		return this.shadowRoot.getElementById("chart2")
	}

	set anchor(val) {
		this.setAttribute("anchor",val)
	}

	set tooltipFn1(val) {this.#_tooltipExtFn1 = val}
	set tooltipFn2(val) {this.#_tooltipExtFn2 = val}
	set tooltipCSS(val) { this.shadowRoot.appendChild(MarkUpCode.getHtmlTemplate(val)) }

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
			this.#showChart1(false)
			ev.stopPropagation()
		})

		this.#$("switchTo1").addEventListener("click", (ev) => {
			this.#showChart1(true)
			ev.stopPropagation()
		})

		this.#$("articleLink").addEventListener("click", (ev) => {
			window.open(this.#_articleLink,"_self")
			ev.stopPropagation()
		})

		this.#showChart1(true)
	}

	// billboard refuses to draw when hidden, so one solution is to move it out of sight
	#showChart1(show) {
		const showPos="0px"
		const hidePos="1000px"
		this.chart1.parentNode.style.top= show?showPos:hidePos
		this.chart2.parentNode.style.top= !show?showPos:hidePos
		this.#setLinks(show)
	}

	static get observedAttributes() {
		return ["anchor", "header", "subtitle", "right1", "right2", "ylabel", "srclinkc", "srclinkb", "articlelink", "infoText"]
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if(name==="anchor") {
			this.#_anchor = newVal
		}
		if( "header subtitle right1 right2".includes(name) ) {
			if(this.shadowRoot.getElementById(name)) {
				this.shadowRoot.getElementById(name).innerHTML = newVal
			} else {
				console.error("chartCard: not initialized yet")
			}
		}
		if(name==="ylabel") {	this.#_yLabel = newVal }
		if(name==="articlelink") { this.#_articleLink = newVal }
		if(name==="srclinkb") { this.#_srcLinkB = newVal }
		if(name==="srclinkc") {	this.#_srcLinkC = newVal }
		if(name==="infotext") {
			//TODO
		}
	}

	// bar chart; please take note of comment on #resize().
	setData1(cols, countryNamesFull, palette, fixColors) {
		Chart.init({
			chartDOMElementId: this.chart1,
			type: "line",
			legendDOMElementId: this.shadowRoot.getElementById("legend1"),
			cols: cols,
			palette: palette,
			fixColors: fixColors,
			seriesLabels: countryNamesFull,
			//suffixText: "getTooltipSuffix()",
			suffixText: "%",	// TODO
			tooltipFn: this.#_tooltipExtFn1,
			onFinished: ()=>setTimeout(()=>this.#resize(true),50)
		})
		this.#setLinks(true)
	}

	// vertically connected dot plot (VCDP); please take note of comment on #resize().
	setData2(cols, countryNamesFull, palette, fixColors) {
		Chart.init({
			chartDOMElementId: this.chart2,
			type: "line",
			cols: cols,
			palette: palette,
			fixColors: fixColors,
			seriesLabels: countryNamesFull,
			//suffixText: "getTooltipSuffix()",
			suffixText: "%",	// TODO
			showLines:false,
			tooltipFn: this.#_tooltipExtFn2,
			labelEveryTick: true,
			onFinished: ()=>setTimeout(()=>this.#resize(false),50)
		})
	}

	#setLinks(linkC) {
		this.#$("sourceLink").setAttribute("href", linkC?this.#_srcLinkC:this.#_srcLinkB)
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
		this.shadowRoot.getElementById("staticLegend").style.display="none"
		this.shadowRoot.getElementById("right1").style.display="none"
		this.shadowRoot.getElementById("right2").style.display="none"
		this.shadowRoot.getElementById("bottomLine").style.display="grid"
		this.shadowRoot.getElementById("chartContainer").style.height="60%"
		this.shadowRoot.getElementById("legend1").style.display="flex"
		this.shadowRoot.getElementById("chart1").style.width="95%"
		this.shadowRoot.querySelector("#chart1 > svg").style.marginLeft="0px"

		this.#_isExpanded = true

		Chart.setYLabel(this.chart1, this.#_yLabel)
		Chart.setYLabel(this.chart2, this.#_yLabel)

		// TODO: let's see if it works well w/o Promises.all (to be correct event should be fired when both resizes are done)
		this.#resize(true, () => {
			const event = new Event("expanding")
			this.dispatchEvent(event)
		})
		this.#resize(false)
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
		this.shadowRoot.getElementById("staticLegend").style.display="block"
		this.shadowRoot.getElementById("right1").style.display="block"
		this.shadowRoot.getElementById("right2").style.display="block"
		this.shadowRoot.getElementById("bottomLine").style.display="none"
		this.shadowRoot.getElementById("chartContainer").style.height="70%"
		this.shadowRoot.getElementById("legend1").style.display="none"
		this.shadowRoot.getElementById("chart1").style.width="100%"
		this.shadowRoot.querySelector("#chart1 > svg").style.marginLeft=`-${MS.shift}px`

		this.#_isExpanded = false

		Chart.setYLabel(this.chart1, null)
		Chart.setYLabel(this.chart2, null)

		// TODO: let's see if it works well w/o Promises.all
		this.#resize(true, () => {
			this.#showChart1(true)
	
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
				const s = this.#_isExpanded ? -150 : Number(MS.shift)
				Chart.resize(this.chart1, r.clientWidth+s, r.clientHeight, callback)
			}
			if(!firstChart && this.chart2) {
				Chart.resize(this.chart2, r.clientWidth+Number(MS.shift), r.clientHeight, callback)
			}
		}
	}

	indicateLoading() {
		this.shadowRoot.getElementById("main").classList.add("loading")
	}

	stopIndicateLoading() {
		this.shadowRoot.getElementById("main").classList.remove("loading")
	}

}

window.customElements.define('chart-card', Element)
