/*
all HTML and CSS as JS string
*/


export default class MarkUpCode {

	// the important is there because FF prefers a different value (per "best match")
	static mainElements(title, w, h, shift) { return `
		<link rel="stylesheet" href="redist/billboard-3.4.1/billboard.min.css">
		<link rel="stylesheet" href="./redist/ecl/ecl-eu.css" />

		<style>
		
			.main {
				width:${w};
				height:${h};
				margin:10px;
				overflow: hidden;
			}
			
			.blueBorder {
				border-width: 2px;
				border-style: solid;
				border-radius: 5px;
				border-color: #ecedf1;
				box-shadow: 1px 1px 4px 2px rgba(0,0,0,.08), inset 0 0 8px rgba(43,53,98,.18);
				transition: box-shadow 0.4s;
			}

			.blueBorder:hover, .blueBorder:focus {
        box-shadow: 2px 2px 6px 4px rgba(0,0,0,0.14), inset 0 0 10px rgba(5, 116, 173, 0.64);
				transition: box-shadow 0.4s;
      }

			.thick-line { stroke-width: 3.5px; }


			#chart1 > svg {
				margin-left: -${shift}px;
			}

			.dot {
				height: 0.6rem;
				width: 0.6rem;
				background-color: #bbb;
				border-radius: 50%;
				display: inline-block;
			}

/* TODO: this is project specific, move out of component */
			.bb-line {
				stroke-width: 3.5px;
			}
			
			.bb-line-M{
				stroke-dasharray: 5;
			}
			
			.bb-line-EU--Non-EU-Born, .bb-line-EU--EU-Born, .bb-line-EU--Native-born, .bb-line-EU--Non-EU-Citizens, .bb-line-EU--EU-Citizens, .bb-line-EU--Nationals {
				stroke-width: 4.5px;
			}

		</style>

		<div tabindex="0" id="main" class="main blueBorder" style="padding:10px; background-color:white;">

			<symbol-button id="close" symbol="close" style="float:right; display:none; margin-right:10px; margin-top:10px;"></symbol-button>

			<div id="slotContainerTop" style="display:none; margin: 10px 10px 10px 0px;"> <slot name="slotTop"></slot> </div>
			<div id="switch" style="height:20px; text-align:right; display:none; margin-top:20px; margin-right:30px;">
				<symbol-button id="switchTo1" symbol="lineChart" style="height: 25px; width: 25px; padding-right:20px;"></symbol-button>
				<symbol-button id="switchTo2" symbol="barChart"  style="height: 25px; width: 25px;"></symbol-button>
			</div>
			<div style="display:flex;">
				<h2 id="header" style="height:auto; margin:3px;">${title}</h2>
				<symbol-button id="info" symbol="info" style="display:none; margin:-4px 0 0 5px;"></symbol-button>
			</div>
			<div id="subtitle" style="height:5%; margin-left:3px;">Subtitle</div>
			<div id="right1" style="height:5%; text-align:right; color:#0e47cb"></div>
			<div id="right2" style="height:5%; text-align:right; color:#0e47cb;"></div>

			<span id="contractedLegend" style="padding: 0px 30px 5px 30px; display:flex; justify-content:space-between;">
				<span>
					<span class="dot" id="dot1"></span>
					<span id="statLegTxt1"></span>
				</span>
				<span style="margin: 0 7px 0 7px;">
					<span class="dot" id="dot2"></span>
					<span id="statLegTxt2"></span>
				</span>
				<span>
					<span class="dot" id="dot3"></span>
					<span id="statLegTxt3"></span>
				</span>
			</span>

			<!-- height modified by JS -->
			<div style="height:60%; width:100%; position:relative;" id='chartContainer'>

				<div style="top:0px; display:flex; background:white; align-items:center;">
					<div id='chart1' style="height:80%;"></div>
					<div style="display:none; height:80%; flex-direction: column; justify-content: space-evenly;" id='legend1'></div>
				</div>
				<div style="top:0px; position:absolute; background:white;">
					<div id='chart2'></div>
				</div>
	
			</div>

			<div id="slotContainerBottom" style="height: 20px; padding-top:20px; padding-left:30px; padding-right:30px; display: none;">
				<slot name="slotBottom"></slot>
			</div>

			<div id="bottomLine" style="display: none; height:40px; grid-template-columns: 1fr 1fr 1fr;">
				<div id="slotContainerBottomLeft">
					<slot name="slotBottomLeft"></slot>
				</div>

				<p style="justify-self: center;">
					<a><span tabindex="0">Source: Eurostat - </span></a>
					<a id="sourceLink"><span tabindex="0">access to dataset</span></a>
				</p>

				<button id="articleLink" class="ecl-button ecl-button--call" type="button" style="width:200px; justify-self: right; margin-right: 30px;">
					<span class="ecl-button__label" data-ecl-label="true">Read the article</span>
						<svg class="ecl-icon ecl-icon--xs ecl-icon--rotate-90 ecl-button__icon ecl-button__icon--after" focusable="false" aria-hidden="true" data-ecl-icon="">
							<use xlink:href="../../redist/ecl/icons.svg#corner-arrow"></use>
						</svg>
				</button>
				
			</div>

		</div>

		${MarkUpCode.loaderCSS()}
	`}

	
	static loaderCSS() {
		return `<style>

		.loading {
			position: relative;
			background: #cccccc;
	}
	.loading:after {
			content: "";
			/*display: block;*/
			/*position: absolute;*/
			top: 0;
			width: 100%;
			height: 100%;
			transform: translateX(-100px);
			background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
			animation: loading 0.8s infinite;
	}
	@keyframes loading {
			100% {
					transform: translateX(100%);
			}

			</style>`
	}

	static legendCSS() {
		return `
		<style>
		.bb-legend-item {
			margin-top:5px;
			padding-top: 0.7em; 
			padding-bottom: 0.7em; 
			padding-left: 2px;
			text-align: left;	/* left alignment when besides chart */
		}
		.coloredDot {
			display: inline-block;
			height: 10px;
			width: 10px;
			border-radius: 5px;
			}
			</style>
		`
	}

	// helper
	static getHtmlTemplate(source) {
		const t = document.createElement('template')
		t.innerHTML = source
		return t.content
	}

}