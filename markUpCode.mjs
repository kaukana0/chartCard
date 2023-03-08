/*
all HTML and CSS as JS string
*/

export default class MarkUpCode {

	static mainElements(title) {
		return `
		<link rel="stylesheet" href="redist/billboard-3.4.1/billboard.min.css">

		<style>
			.main {
				width:500px;
				height:500px;
				margin:10px;
				border-width: 1px;
				border-style: solid;
				border-radius: 15px;
				overflow: hidden;
			}
		</style>

		<div tabindex="0" class="main" style="padding:10px; background-color:white;">
			<div style="height:10%;">${title}</div>
			<div style="height:5%;">Subtitle</div>
			<div id="slotContainer" style="display:none;"> <slot name="slot1"></slot> </div>
			<div style="height:10%; text-align:right;">100.0%</div>
			<div style="height:5%; text-align:right;">2023</div>
			<div style="height:70%;" id='chart'></div>
		</div>
		`
	}

  	// helper
	static getHtmlTemplate(source) {
		const t = document.createElement('template')
		t.innerHTML = source
		return t.content
	}

}