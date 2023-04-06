/*
all HTML and CSS as JS string
*/

export default class MarkUpCode {

	// TODO: put .hide-line in chart, not here
	static mainElements(title) { return `
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
			.hide-line { stroke-width: 0px; }
		</style>

		<div tabindex="0" id="main" class="main" style="padding:10px; background-color:white;">
			<div id="close" style="right:10px; top:10px;">X</div>
			<div id="slotContainer" style="display:none;"> <slot name="slot1"></slot> </div>
			<div id="switch" style="height:1%; text-align:right;">
				<p id="switchTo1" style="display:inline;">Line</p>
				<p id="switchTo2" style="display:inline;">Bar</p>
			</div>
			<div id="title" style="height:10%;">${title}</div>
			<div id="subtitle" style="height:5%;">Subtitle</div>
			<div id="right1" style="height:5%; text-align:right;">100.0%</div>
			<div id="right2" style="height:5%; text-align:right;">2023</div>
			<div style="height:10%;" id='legend'></div>
			<div style="height:70%; position:relative;" id='chartContainer'>
				<div style="top:0px; position:absolute; background:white;">
					<div id='chart1'></div>
				</div>
				<div style="top:0px; position:absolute; background:white;">
					<div id='chart2'></div>
				</div>
			</div>
		</div>
	`}

  	// helper
	static getHtmlTemplate(source) {
		const t = document.createElement('template')
		t.innerHTML = source
		return t.content
	}

}