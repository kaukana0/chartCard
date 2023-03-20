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
		const tmp = MarkUpCode.getHtmlTemplate(MarkUpCode.mainElements("BLABLA"+(Math.random()*100))).cloneNode(true)
		this.shadowRoot.appendChild(tmp)
		this.#_isExpanded = false
	}

	get chart() {
		return this.shadowRoot.getElementById("chart")
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
	}

	static get observedAttributes() {
		return ["anchor"]
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if(name==="anchor") {
			this.#_anchor = newVal
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
		const chart = this.shadowRoot.getElementById("chart")
		const div = this.shadowRoot.querySelector(".main")
		const sroot = this

		this.storedStyles = {
			chart: Object.assign({}, chart.style), 
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

		//Chart.resize(chart, div.clientWidth, div.clientHeight)
		this.#_isExpanded = true
	}

	contract() {
		const chart = this.shadowRoot.getElementById("chart")
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
		this.#_isExpanded = false
	}

	setData(data) {
		const labels = new Map()
		labels.set("XY","Tleilaxu")
		labels.set("EO","Eolomea")

		Chart.init({
			type: "line",
			chartDOMElementId: this.chart,
			//legendDOMElementId: "legend",
			cols: data.cols,
			//fixColors: {...data.countryColors, ...data.indexColors},
			palette: data.colorPalette,
			seriesLabels: labels,
			//suffixText: "getTooltipSuffix()",
			//isRotated: false,
			//onFinished: onFinished
		})
		Chart.setYLabel(this.chart, "some Y label")
	}
}

window.customElements.define('chart-card', Element)
