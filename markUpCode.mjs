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
				display:flex;
				flex-wrap: wrap;
				flex-direction: column;
				
				width:${w};
				height:${h};
				margin:10px;
				padding:10px;
				overflow: hidden;
				overscroll-behavior: none;
				background-color: white;
				color: #262b38; /*dark100*/

				--offsety: 0px;
			}

			.mousePointer {
				cursor: pointer;
			}

			.noMargin {
				margin:0;
				padding:0 35px 0 35px;
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

/*
			div.dbg {
				outline-style: dashed;
				outline-width: 1px;
				outline-offset:-1px;
			}
			
			div.dbg:nth-child(odd) {
					background-color: aliceblue;
			}
			
			div.dbg:nth-child(even) {
					background-color: antiquewhite;
			}
*/

			@media (max-width: 1180px) {
				.footer-forceBreak {
					width: 100%;
					display:flex;
					justify-content:center;
				}
			}
			@media (min-width: 1180px) {
				.footer-end {
					justify-content:flex-end;
				}
			}
			/* only visible for dims that make sense to make a screen-hardcopy of - ie where all selectboxes + chart are visible */
			@media (orientation:portrait), (max-width: 1180px) {
				#downloadLink {display:none;}
			}

			.switchToButton { width: 50px; height: 50px; margin-top:-20px; }
			#info { width: 35px; height: 35px; }
			@media (max-width: 995px) {
				#close {
					visibility: hidden;
				}
				.switchToButton { width: 35px; height: 35px; margin-top:0px; }
				#info { width: 35px; height: 35px; margin-right:25px; }
			}

			@media (max-width: 529px) {
				#main {
					width:300px;
					height:300px;
				}
				.shrinkOnContracted {
					max-height:53%;
				}
				h2 {
					font-size:1.2em;
				}
				#contractedLegend {
					padding-left:10px !important;
				}
			}

			.shrinkOnContracted {
				height:61%;
			}

			.growOnExpanded {
				height:45vh;
			}

			.hideCard {
				width:0px !important;
				height:0px !important;
			}

			#header_c {
				font-size:18px;
			}

		</style>





		<div tabindex="0" id="main" class="main blueBorder mousePointer">

			<!-- slot for selects; close button -->
			<div id="row1" style="display:flex; width:100%;" class="dbg">
				<div id="slotContainerTop" style="display:none; flex-grow:1; margin: 10px 10px 10px 0px;"> <slot name="slotTop"></slot> </div>
				<symbol-button id="close" symbol="close" style="max-width:32px; max-height:32px; min-width:32px; min-height:32px; display:none; margin:20px -10px 0 0;" data-html2canvas-ignore aria-label="Button closing currently expanded card" alt="Close"></symbol-button>
			</div>

			<!-- headers' buttons are moved here on narrow width -->
			<div id="row2" style="display:flex; width:100%; justify-content: flex-end;" class="dbg"></div>

			<!-- headers, buttons -->
			<div id="row3" style="display:flex; width:100%; margin: 5px 0 5px 0;" class="dbg">

				<!-- only one header is visible at a time, for contracted and for expanded card -->
				<div style="display:flex; flex-direction:column;" aria-hidden="true">
					<h2 id="header_c" style="height:auto; margin:3px;">${title}</h2>
					<div id="subtitle_c" style="margin-left:3px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">...</div>
				</div>
				<div style="display:flex; flex-direction:column; flex-grow:1;">
					<div id="row3header" style="display:flex; align-items:center;">
						<h2 id="header_e" style="display:none; height:auto; margin-top: 3px; margin-right: 10px; margin-bottom:3px;">${titleLong}</h2>
						<symbol-button id="info" symbol="info" style="display:none;" data-html2canvas-ignore alt="Information" aria-label="Button opening Dialog with Information about the Indicator." aria-haspopup="dialog" title="Indicator information"></symbol-button>
					</div>
					<div id="subtitle_e" style="display:none; height:auto; margin-top: 3px; margin-right: 10px; margin-bottom:3px;">Subtitle</div>
				</div>


				<div id="switch" style="display:none; height:20px; display:flex; justify-content: flex-end;" data-html2canvas-ignore>
					<symbol-button class="switchToButton" id="switchTo1" symbol="lineChart" size="42" symbolDeactivated="lineChart" style="max-width:44px; max-height:44px; min-width:44px; min-height:44px; display:none; padding-right:20px;" alt="Switch to Line Chart" aria-label="Switch to Line Chart" isactivated></symbol-button>
					<symbol-button class="switchToButton" id="switchTo2" symbol="dotPlot"  size="42"  symbolDeactivated="dotPlot"     style="max-width:44px; max-height:44px; min-width:44px; min-height:44px; display:none;" alt="Switch to Dot Plot" aria-label="Switch to Dot Plot"></symbol-button>
				</div>
			</div>

			<!-- text right (country in overview) -->
			<div id="row4" style="width:100%;" class="dbg" aria-hidden="true">
				<div id="right1" style="height:5%; text-align:right; color:#0e47cb">...</div>
				<div id="right2" style="height:5%; text-align:right; color:#0e47cb;"></div>
			</div>

			<!-- legend when contracted (ie overview legend) -->
			<div id="row5" style="width:100%;" class="dbg" aria-hidden="true">
				<span id="contractedLegend" style="padding: 0px 30px 5px 30px; display:flex; flex-direction:column; justify-content:space-between; line-height: 1.2rem; max-height: 70px;">
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
			</div>

			<!-- row6; height modified by JS -->
			<div id='chartContainer' style="width:100%;" class="shrinkOnContracted dbg">

					<div style="display: flex; width:100%; height:100%; background:white;">
						<div id='chart1' style="width:100%;"></div>
						<div id='legend1' style="display:none; width: 60px; flex-direction: column; justify-content: flex-start; margin: 10px 0 0 0;"></div>
					</div>
					<div style="display: none; width:100%; height:100%; background:white;" id="chart2container">
						<div id='chart2' style="width:100%;"></div>
					</div>
					<div style="top:0px; background:#f0f8ff; width:100%; height:115%; display:flex; align-items:center; justify-content:center; border-radius:6px;">
						<div id='dataUnavailableMsg' class='na'>No data available</div>
					</div>
					<div style="top:0px; background:lightblue;">
						<div id='loadingMsg'>Loading</div>
					</div>
		
			</div>


			<div id="row7" style="display:flex; width:100%;" class="dbg">
				<div id="slotContainerBottom" style="height: 20px; width:100%; padding-top:20px; padding-left:30px; padding-right:30px; display: none;">
					<slot name="slotBottom"></slot>
				</div>
			</div>



			<!-- footer tryptychon (detail legend, source link, some buttons) -->
			<!-- attention: "display:flex" in JS -->
			<div id="bottomLine" style="display:none; flex-wrap:wrap; max-width:100%;">

				<!-- attention: "display:flex" in JS -->
				<div id="slotContainerBottomLeft" class="footer-forceBreak" style="display:flex;">
					<slot name="slotBottomLeft"></slot>
				</div>

				<div style="display:flex; flex-grow:1; justify-content:center;" class="footer-forceBreak">
					<!--center-->
						<p>
							<a><span>Source: Eurostat - </span></a>
							<a id="sourceLink"><span>access to dataset</span></a>
						</p>
					<!--/center-->
				</div>

				<div style="display:flex; margin: 10px;" class="footer-end footer-forceBreak">

					<button id="downloadLink" class="ecl-button ecl-button--primary" type="button" style="width:140px; height: 45px; justify-self: right; margin: 5px" data-html2canvas-ignore>
						<svg class="ecl-icon ecl-icon--xs ecl-button__icon ecl-button__icon--after" focusable="false" aria-hidden="true" data-ecl-icon="">
							<use xlink:href="./redist/ecl/icons.svg#download"></use>
						</svg>
						<span class="ecl-button__label" data-ecl-label="true">Download</span>
					</button>

					<button id="articleLink" class="ecl-button ecl-button--call" type="button" style="width:155px; height: 45px; justify-self: right; margin: 5px 30px; padding:0; display:flex; align-items:center;" data-html2canvas-ignore>
						<span style="flex-grow:1; padding:0;" class="" data-ecl-label="true">Read the article</span>
						<svg class="ecl-icon ecl-icon--xs ecl-icon--rotate-90 ecl-button__icon ecl-button__icon--after" focusable="false" aria-hidden="true" data-ecl-icon="" style="margin: 0px 5px 0 0; padding:0;">
							<use xlink:href="./redist/ecl/icons.svg#corner-arrow"></use>
						</svg>
					</button>

				</div>
				
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
			padding-left: 2px;
			text-align: left;	/* left alignment when besides chart */
			font-family: Arial,sans-serif;
			font-size: 15px;
		}
		.legendItemColor {
			display: inline-block;
			height: 24px;
			width: 24px;
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