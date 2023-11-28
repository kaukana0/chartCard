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

				--offsety: 0px;
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
			/* ony visible for dims that make sense to make a screen-hardcopy of - ie where all selectboxes + chart are visible */
			@media (orientation:portrait), (max-width: 1180px) {
				#downloadLink {display:none;}
			}
			@media (max-width: 540px) {
				#close {
					visibility: hidden;
				}
			}

		</style>





		<div tabindex="0" id="main" class="main blueBorder">

			<!-- slot for selects; close button -->
			<div id="row1" style="display:flex; width:100%;" class="dbg">
				<div id="slotContainerTop" style="display:none; flex-grow:1; margin: 10px 10px 10px 0px;"> <slot name="slotTop"></slot> </div>
				<symbol-button id="close" symbol="close" style="width:30px; display:none; margin:40px 50px;" tabindex="0"></symbol-button>
			</div>

			<!-- headers, buttons are moved here on narrow width -->
			<div id="row2" style="display:flex; width:100%;" class="dbg"></div>

			<!-- headers, buttons -->
			<div id="row3" style="display:flex; width:100%;" class="dbg">
				<div style="display:flex; flex-direction:column;">
					<h2 id="header_c" style="height:auto; margin:3px;">${title}</h2>
					<div id="subtitle_c" style="height:5%; margin-left:3px;"></div>
				</div>
					
				<div style="display:flex; flex-direction:column;">
					<h2 id="header_e" style="display:none; height:auto; margin-top: 3px; margin-right: 10px; margin-bottom:3px;">${titleLong}</h2>
					<div id="subtitle_e" style="display:none; height:5%; margin-top: 3px; margin-right: 10px; margin-bottom:3px;">Subtitle</div>
				</div>

				<symbol-button id="info" symbol="info" style="display:none; margin-right:5px; flex-grow:1; align-self:center;" tabindex="0"></symbol-button>

				<div id="switch" style="height:20px; text-align:right; display:none; margin-top:5px; margin-right:30px;">
					<symbol-button id="switchTo1" symbol="lineChart" style="height: 25px; width: 25px; padding-right:20px;" tabindex="0"></symbol-button>
					<symbol-button id="switchTo2" symbol="dotPlot"  style="height: 25px; width: 25px;" tabindex="0"></symbol-button>
				</div>
			</div>

			<!-- text right (country in overview) -->
			<div id="row4" style="width:100%;" class="dbg">
				<div id="right1" style="height:5%; text-align:right; color:#0e47cb"></div>
				<div id="right2" style="height:5%; text-align:right; color:#0e47cb;"></div>
			</div>

			<!-- legend when contracted (ie overview legend) -->
			<div id="row5" style="width:100%;" class="dbg">
				<span id="contractedLegend" style="padding: 0px 30px 5px 30px; display:flex; flex-direction:column; justify-content:space-between; ">
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

			<div id="row6" style="display:flex; width:100%;" class="dbg"></div>

			<!-- row7; height modified by JS -->
			<div id='chartContainer' style="width:100%; height:62%; position:relative; display:flex;" class="dbg">

					<div id="scream" style="top:0px; display:flex; position:absolute; background:white;">
						<div id='chart1' style="flex-grow:1;"></div>
						<div id='legend1' style="display:none; flex-direction: column; justify-content: flex-start; margin: 10px 50px 0 0"></div>
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


			<div id="row8" style="display:flex; width:100%;" class="dbg">
				<div id="slotContainerBottom" style="height: 20px; width:100%; padding-top:20px; padding-left:30px; padding-right:30px; display: none;">
					<slot name="slotBottom"></slot>
				</div>
			</div>



			<!-- footer tryptychon (detail legend, source link, some buttons) -->
			<!-- attentions: "display:flex" in JS -->
			<div id="bottomLine" style="display:none; flex-wrap:wrap; max-width:100%;">

				<!-- attentions: "display:flex" in JS -->
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