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
			<button id="close" type="button" style="float:right; display:none;">X</button>
			<div id="slotContainer" style="display:none;"> <slot name="slot1"></slot> </div>
			<div id="switch" style="height:1%; text-align:right; display:none;">
				<button id="switchTo1" type="button">Line</button>
				<button id="switchTo2" type="button">Bar</button>
			</div>
			<h2 id="header" style="height:10%;">${title}</h2>
			<div id="subtitle" style="height:5%;">Subtitle</div>
			<div id="right1" style="height:5%; text-align:right;">100.0%</div>
			<div id="right2" style="height:5%; text-align:right;">2023</div>


			<div style="height:70%; position:relative;" id='chartContainer'>

				<div style="top:0px; position:absolute; background:white;   display: flex; flex-direction: row; flex-wrap: wrap; width: 100%;  ">
					<div id='chart1' style="display: flex; flex-direction: column; flex-basis: 100%; flex: 4;"></div>
					<div style="height:10%;    display: flex; flex-direction: column; flex-basis: 100%; flex: 1; " id='legend1'></div>
				</div>
				<div style="top:0px; position:absolute; background:white;">
					<div style="height:10%;" id='legend2'></div>
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