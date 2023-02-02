import MarkUpCode from  "./markUpCode.mjs"		// keep this file html/css free
import * as Chart from "../chart/chart.mjs"
import {process as defineCountryColors} from "../processorCountryColors/countryColors.mjs"

// magic strings
const ms = {
}

class Element extends HTMLElement {

	#_isZoomed

	#$(elementId) {
		return this.shadowRoot.getElementById(elementId)
	}

	constructor() {
		super()
		this.attachShadow({mode: 'open'})
		const tmp = MarkUpCode.getHtmlTemplate(MarkUpCode.mainElements("BLABLA"+(Math.random()*100))).cloneNode(true)
		this.shadowRoot.appendChild(tmp)
		this.#_isZoomed = false
	}

	get chart() {
		return this.shadowRoot.getElementById("chart")
	}

	connectedCallback() {
		let data = {}
		defineCountryColors({}, data)
	
		const labels = new Map()
		labels.set("XY","Tleilaxu")
		labels.set("EO","Eolomea")

		const cols = [
			['08-2022', '09-2022', '10-2022', '11-2022', '12-2022'],
			['XY'],
			['EO']
		]

		for(var i=0;i<5;i++) {
			cols[1].push(Math.random()*100)
			cols[2].push(Math.random()*100)
		}

		Chart.init({
			type: "line",
			chartDOMElementId: this.chart,
			//legendDOMElementId: "legend",
			cols: cols,
			//fixColors: {...data.countryColors, ...data.indexColors},
			palette: data.colorPalette,
			seriesLabels: labels,
			//suffixText: "getTooltipSuffix()",
			//isRotated: false,
			//onFinished: onFinished
		})
		Chart.setYLabel(this.chart, "some Y label")

		//const d = new Map()
		//d.set("EU27_2020", 'European Union')
		//d.set("GR", 'Greek')
		//d.set("UG", 'Uganda')
		//this.shadowRoot.querySelector("dropdown-box").data = [d, ["GR"]]
		//this.shadowRoot.querySelector("dropdown-box").callback = () => console.log("HOWDY")
	}

	static get observedAttributes() {
		return []
	}

	attributeChangedCallback(name, oldVal, newVal) {
	}

	toggleZoom(relativeTo) {
		if(this.#_isZoomed) {
			this.gb()
		} else {
			this.zi(relativeTo)
		}
		this.#_isZoomed = !this.#_isZoomed
		return this.#_isZoomed
	}

	zi(relativeTo) {
		const chart = this.shadowRoot.getElementById("chart")
		const div = this.shadowRoot.querySelector(".main")
		const sroot = this

		this.storedStyles = {chart:Object.assign({}, chart.style), 
			div:Object.assign({}, div.style), 
			sroot:Object.assign({}, sroot.style)}
			
		sroot.style.position="fixed"
		sroot.style.zIndex="1"

		div.style.position="fixed"
		div.style.width="98.5%"
		div.style.height= window.innerHeight - relativeTo.getBoundingClientRect().bottom - window.scrollY + 60 + "px"
		div.style.top="-10px"
  	div.style.left="-10px"
		div.style.borderRadius=0
	}

	gb() {
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
	}

	attachElement(el) {
		//const tmp = MarkUpCode.getHtmlTemplate(MarkUpCode.dropdownBox())
		this.shadowRoot.querySelector("div").after(el)
	}

	yankElement() {
		return this.shadowRoot.querySelector("dropdown-box")
	}
}

window.customElements.define('chart-card', Element)
