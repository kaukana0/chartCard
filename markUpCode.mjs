/*
all HTML and CSS as JS string
*/


export default class MarkUpCode {

	// the important is there because FF prefers a different value (per "best match")
	static mainElements(title, titleLong, w, h, shift) { return `
		<link rel="stylesheet" href="redist/billboard-3.4.1/billboard.min.css">
		<link rel="stylesheet" href="./redist/ecl/ecl-eu.css" />

		<style>
		
			.main {
				width:${w};
				height:${h};
				margin:10px;
				padding:10px;
				overflow: hidden;
				background-color: white;
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

			#chart1 > svg .bb-line {
				stroke-width: 3.5px !important;
			}
			
			.bb-line-M{
				stroke-dasharray: 5;
			}

			#chart1 > svg  [class*="bb-line-EU"]
			{
				stroke-width: 4.5px !important;
			}

			.na {
				font-family: Arial,sans-serif;
				font-size: 22px;
				color:#4d6cc0;
			}

		</style>

		<div tabindex="0" id="main" class="main blueBorder" style="">

			<symbol-button id="close" symbol="close" style="float:right; display:none; margin-right:10px; margin-top:10px;"></symbol-button>

			<div id="slotContainerTop" style="display:none; margin: 10px 10px 10px 0px;"> <slot name="slotTop"></slot> </div>
			<div id="switch" style="height:20px; text-align:right; display:none; margin-top:5px; margin-right:30px;">
				<symbol-button id="switchTo1" symbol="lineChart" style="height: 25px; width: 25px; padding-right:20px;"></symbol-button>
				<symbol-button id="switchTo2" symbol="dotPlot"  style="height: 25px; width: 25px;"></symbol-button>
			</div>
			<div style="display:flex;">
				<h2 id="header_c" style="height:auto; margin:3px;">${title}</h2>
				<h2 id="header_e" style="display:none; height:auto; margin: 3px 10px 3px 25px;">${titleLong}</h2>
				<symbol-button id="info" symbol="info" style="display:none; margin:-4px 0 0 5px;"></symbol-button>
			</div>
			<div id="subtitle_c" style="height:5%; margin-left:3px;"></div>
			<div id="subtitle_e" style="display:none; height:5%; margin: 3px 10px 3px 25px;">Subtitle</div>
			<div id="right1" style="height:5%; text-align:right; color:#0e47cb"></div>
			<div id="right2" style="height:5%; text-align:right; color:#0e47cb;"></div>

			<span id="contractedLegend" style="margin-top:-15px; padding: 0px 30px 5px 30px; display:flex; flex-direction:column; justify-content:space-between; ">
				<span id="contractedLegendItem1">
					<span class="dot" id="dot1"></span>
					<span id="statLegTxt1"></span>
				</span>
				<span id="contractedLegendItem2">
					<span class="dot" id="dot2"></span>
					<span id="statLegTxt2"></span>
				</span>
				<span id="contractedLegendItem3">
					<span class="dot" id="dot3"></span>
					<span id="statLegTxt3"></span>
				</span>
			</span>

			<!-- height modified by JS -->
			<div style="height:66%; width:100%; position:relative;" id='chartContainer'>

				<div style="top:0px; display:flex; position:absolute; background:white;">
					<div id='chart1'></div>
					<div style="display:none; flex-direction: column; justify-content: flex-start; margin: 10px 50px 0 0" id='legend1'></div>
				</div>
				<div style="top:0px; position:absolute; background:white;">
					<div id='chart2'></div>
				</div>
				<div style="top:0px; position:absolute; background:#f0f8ff; width:100%; height:115%; display:flex; align-items:center; justify-content:center; border-radius:6px;">
					<div id='dataUnavailableMsg' class='na'>No data available</div>
				</div>
				<div style="top:0px; position:absolute; background:lightblue;">
					<div id='loadingMsg'>Loading</div>
				</div>
	
			</div>

			<div id="slotContainerBottom" style="height: 20px; padding-top:20px; padding-left:30px; padding-right:30px; display: none;">
				<slot name="slotBottom"></slot>
			</div>

			<div id="bottomLine" style="display: none; height:40px; grid-template-columns: 1fr 1fr 1fr; margin-left:20px;">
				<div id="slotContainerBottomLeft">
					<slot name="slotBottomLeft"></slot>
				</div>

				<p style="justify-self: center;">
					<a><span tabindex="0">Source: Eurostat - </span></a>
					<a id="sourceLink"><span tabindex="0">access to dataset</span></a>
				</p>

				<div style="display:flex; justify-content:flex-end; margin: 10px 70px;">

					<button id="downloadLink" class="ecl-button ecl-button--primary" type="button" style="width:140px; height: 45px; justify-self: right; margin: 5px">
						<svg class="ecl-icon ecl-icon--xs ecl-button__icon ecl-button__icon--after" focusable="false" aria-hidden="true" data-ecl-icon="">
							<use xlink:href="./redist/ecl/icons.svg#download"></use>
						</svg>
						<span class="ecl-button__label" data-ecl-label="true">Download</span>
					</button>

					<button id="articleLink" class="ecl-button ecl-button--call" type="button" style="width:155px; height: 45px; justify-self: right; margin: 5px 30px; padding:0; display:flex; align-items:center;">
						<span style="flex-grow:1; padding:0;" class="" data-ecl-label="true">Read the article</span>
						<svg class="ecl-icon ecl-icon--xs ecl-icon--rotate-90 ecl-button__icon ecl-button__icon--after" focusable="false" aria-hidden="true" data-ecl-icon="" style="margin: 0px 5px 0 0; padding:0;">
							<use xlink:href="./redist/ecl/icons.svg#corner-arrow"></use>
						</svg>
					</button>

				</div>
				
			</div>

		</div>

		<!--ecl-like-modal id="modal"></ecl-like-modal-->

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
			padding-left: 2px;
			text-align: left;	/* left alignment when besides chart */
			font-family: Arial,sans-serif;
			font-size: 15px;
		}
		.coloredDot {
			display: inline-block;
			height: 26px;
			width: 26px;
			border-radius: 14px;
		}
		.disabledDotLine {
			border: 3px solid rgba(0,0,0,.2);
			display: block;
			position: absolute !important;
			width: 25px;
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