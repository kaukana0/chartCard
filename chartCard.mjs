import MarkUpCode from  "./markUpCode.mjs"		// keep this file html/css free
import * as Chart from "../chart/chart.mjs"

// magic strings
const ms = {
}

// note: The card isn't aware about the slot content - it makes no assumptions about what it is.
class Element extends HTMLElement {

	#_isExpanded
	#_anchor
	#_zIndex								// [zroot, zback for chart, zfront for chart, addend] - addend is added to all z-indices when expanded

	#$(elementId) {
		return this.shadowRoot.getElementById(elementId)
	}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		const tmp = MarkUpCode.getHtmlTemplate(MarkUpCode.mainElements("No title")).cloneNode(true)
		this.shadowRoot.appendChild(tmp)
		this.#_isExpanded = false
		this.#_zIndex = [1,2,3,10]		// root, back, front, added to all when expanded
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

	set zroot(val) { this.setAttribute("zroot",val)	}
	set zback(val) {		this.setAttribute("zback",val)	}
	set zfront(val) {		this.setAttribute("zfront",val)	}
	set zaddend(val) {		this.setAttribute("zaddend",val)	}

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
			// billboard doesn't like to draw when hidden, so one solution is to fiddle about w/ zindex
			const add = this.#_isExpanded ? this.#_zIndex[3] : 0
			this.style.zIndex=Number(this.#_zIndex[0])+Number(add)
			this.chart1.parentNode.style.zIndex=Number(this.#_zIndex[1])+Number(add)
			this.chart2.parentNode.style.zIndex=Number(this.#_zIndex[2])+Number(add)
			ev.stopPropagation()
		})

		this.#$("switchTo1").addEventListener("click", (ev) => {
			const add = this.#_isExpanded ? this.#_zIndex[3] : 0
			this.style.zIndex=Number(this.#_zIndex[0])+Number(add)
			this.chart1.parentNode.style.zIndex=Number(this.#_zIndex[2])+Number(add)
			this.chart2.parentNode.style.zIndex=Number(this.#_zIndex[1])+Number(add)
			ev.stopPropagation()
		})
	}

	static get observedAttributes() {
		return ["anchor", "title", "subtitle", "right1", "right2", "zroot", "zback", "zfront", "zaddend"]
	}

	attributeChangedCallback(name, oldVal, newVal) {
		if(name==="anchor") {
			this.#_anchor = newVal
		}
		if( "title subtitle right1 right2".includes(name) ) {
			this.shadowRoot.getElementById(name).innerHTML = newVal
		}
		if(name==="zroot") {			this.#_zIndex[0] = Number(newVal)		}
		if(name==="zback") {			this.#_zIndex[1] = Number(newVal)		}
		if(name==="zfront") {			this.#_zIndex[2] = Number(newVal)		}
		if(name==="zaddend") {			this.#_zIndex[3] = Number(newVal)		}
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
		this.#resize()
		this.#_isExpanded = false
	}

	setData1(data) {
		Chart.init({
			type: "line",
			chartDOMElementId: this.chart1,
			legendDOMElementId: this.shadowRoot.getElementById("legend"),
			cols: data.cols,
			//fixColors: {...data.countryColors, ...data.indexColors},
			palette: data.colorPalette,
			seriesLabels: data.seriesLabels,
			//suffixText: "getTooltipSuffix()",
			//isRotated: false,
			onFinished: this.#resize.bind(this)
		})
		Chart.setYLabel(this.chart1, "some Y label")
	}

	setData2(data) {
		Chart.init({
			type: "bubble",
			chartDOMElementId: this.chart2,
			legendDOMElementId: this.shadowRoot.getElementById("legend"),
			cols: data.cols,
			//fixColors: {...data.countryColors, ...data.indexColors},
			palette: data.colorPalette,
			seriesLabels: data.seriesLabels,
			//suffixText: "getTooltipSuffix()",
			//isRotated: false,
			onFinished: this.#resize.bind(this)
		})
	}

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
