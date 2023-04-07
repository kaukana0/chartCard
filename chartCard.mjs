import MarkUpCode from  "./markUpCode.mjs"		// keep this file html/css free
import * as Chart from "../chart/chart.mjs"

// magic strings
const ms = {
}

// note: The card isn't aware about the slot content - it makes no assumptions about what it is.
class Element extends HTMLElement {

	#_isExpanded
	#_anchor

	#$(elementId) {
		return this.shadowRoot.getElementById(elementId)
	}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		const tmp = MarkUpCode.getHtmlTemplate(MarkUpCode.mainElements("No title")).cloneNode(true)
		this.shadowRoot.appendChild(tmp)
		this.#_isExpanded = false
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

	connectedCallback() {
		this.#$("close").addEventListener("click", (ev) => {
			if(this.#_isExpanded) {
				const event = new Event("contracting")
				this.dispatchEvent(event)

				this.contract() 
			}
			ev.stopPropagation()
		})

		this.#$("main").addEventListener("click", () => {
			if(!this.#_isExpanded) {
				const event = new Event("expanding")
				this.dispatchEvent(event)

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

		this.#showChart1(true)
	}

	// billboard doesn't like to draw when hidden, so one solution is to move it out of sight
	#showChart1(show) {
		const showPos="0px"
		const hidePos="1000px"
		this.chart1.parentNode.style.top= show?showPos:hidePos
		this.chart2.parentNode.style.top= !show?showPos:hidePos
	}

	static get observedAttributes() {
		return ["anchor", "header", "subtitle", "right1", "right2"]
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if(name==="anchor") {
			this.#_anchor = newVal
		}
		if( "header subtitle right1 right2".includes(name) ) {
			this.shadowRoot.getElementById(name).innerHTML = newVal
		}
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
		const div = this.shadowRoot.querySelector(".main")
		const sroot = this

		// TODO: check if chart2 has to be considered here
		this.storedStyles = {
			chart: Object.assign({}, this.chart1.style), 
			div:Object.assign({}, div.style), 
			sroot:Object.assign({}, sroot.style)
		}
			
		sroot.style.position="fixed"
		sroot.style.zIndex="1"

		div.style.position="fixed"
		div.style.width="98.5%"
		div.style.height= window.innerHeight - relativeTo.getBoundingClientRect().bottom - window.scrollY + 60 + "px"
		div.style.top="-10px"
		div.style.left="-10px"
		div.style.borderRadius=0

		this.shadowRoot.getElementById("slotContainer").style.display="inline"
		this.shadowRoot.getElementById("close").style.display="inline"
		this.shadowRoot.getElementById("switch").style.display="block"
		this.#resize()
		this.#_isExpanded = true
	}

	contract() {
		const div = this.shadowRoot.querySelector(".main")
		const sroot = this

		sroot.style.position=""
		sroot.style.zIndex=""
		sroot.style.width=this.storedStyles.sroot.width
		sroot.style.height= this.storedStyles.sroot.width

		div.style.position=""
		div.style.width=this.storedStyles.div.width
		div.style.height=this.storedStyles.div.height
		div.style.top=""
		div.style.left=""
		div.style.zIndex=""
		div.style.borderRadius=this.storedStyles.div.borderRadius

		this.shadowRoot.getElementById("slotContainer").style.display="none"
		this.shadowRoot.getElementById("close").style.display="none"
		this.shadowRoot.getElementById("switch").style.display="none"
		this.#resize()
		this.#_isExpanded = false

		this.#showChart1(true)
	}

	setData1(cols, colorPalette, seriesLabels) {
		Chart.init({
			type: "line",
			chartDOMElementId: this.chart1,
			legendDOMElementId: this.shadowRoot.getElementById("legend1"),
			cols: cols,
			//fixColors: {...data.countryColors, ...data.indexColors},
			palette: colorPalette,
			seriesLabels: seriesLabels,
			//suffixText: "getTooltipSuffix()",
			//onFinished: this.#resize.bind(this)
		})
		Chart.setYLabel(this.chart1, "some Y label")
	}

	setData2(cols, colorPalette, seriesLabels) {
		Chart.init({
			type: "line",
			chartDOMElementId: this.chart2,
			legendDOMElementId: this.shadowRoot.getElementById("legend2"),
			cols: cols,
			//fixColors: {...data.countryColors, ...data.indexColors},
			palette: colorPalette,
			seriesLabels: seriesLabels,
			//suffixText: "getTooltipSuffix()",
			//onFinished: this.#resize.bind(this)
			showLines:false
		})
	}

	// take care: billboard doesn't like to get fed data while resizing. 
	#resize() {
		if(this && this.shadowRoot) {
			const r = this.shadowRoot.getElementById("chartContainer")
			if(this.chart1) {
				Chart.resize(this.chart1, r.clientWidth, r.clientHeight*0.8)
			}
			if(this.chart2) {
				Chart.resize(this.chart2, r.clientWidth, r.clientHeight*0.8)
			}
		}
	}
}

window.customElements.define('chart-card', Element)
