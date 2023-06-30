/*
all HTML and CSS as JS string
*/


export default class MarkUpCode {

	// the important is there because FF prefers a different value (per "best match")
	static mainElements(title, w, h) { return `
		<link rel="stylesheet" href="redist/billboard-3.4.1/billboard.min.css">
		<link rel="stylesheet" href="./redist/ecl/ecl-eu.css" />

		<style>
		
			.main {
				width:${w};
				height:${h};
				margin:10px;
				border-width: 2px;
				border-style: solid;
				border-radius: 5px;
				border-color: #ecedf1;
				overflow: hidden;
				box-shadow: 1px 1px 4px 2px rgba(0,0,0,.08), inset 0 0 8px rgba(43,53,98,.18);
				transition: box-shadow 0.4s;
			}

			.main:hover, .main:focus {
        box-shadow: 2px 2px 6px 4px rgba(0,0,0,0.14), inset 0 0 10px rgba(5, 116, 173, 0.64);
				transition: box-shadow 0.4s;
      }

			.thick-line { stroke-width: 3.5px; }

			#chart1 > svg {
				margin-left:-25px;
			}

		</style>

		<div tabindex="0" id="main" class="main" style="padding:10px; background-color:white;">

			<symbol-button id="close" symbol="close" style="float:right; display:none; margin-right:10px; margin-top:10px;"></symbol-button>

			<div id="slotContainer" style="display:none; margin:10px;"> <slot name="slotTop"></slot> </div>
			<div id="switch" style="height:40px; text-align:right; display:none; margin-top:20px; margin-right:30px;">
				<symbol-button id="switchTo1" symbol="lineChart" style="height: 25px; width: 25px; padding-right:20px;"></symbol-button>
				<symbol-button id="switchTo2" symbol="barChart"  style="height: 25px; width: 25px;"></symbol-button>
			</div>
			<h2 id="header" style="height:auto; margin:3px;">${title}</h2>
			<div id="subtitle" style="height:5%;">Subtitle</div>
			<div id="right1" style="height:5%; text-align:right; color:#0e47cb"></div>
			<div id="right2" style="height:5%; text-align:right; color:#0e47cb;"></div>

			<center>	<img id="staticLegend" src="./img/static-legend.png" alt="legend"/>	 </center>

			<!-- height modified per JS -->
			<div style="height:70%; width:105%; position:relative;" id='chartContainer'>

				<div style="top:0px; position:absolute; background:white; width: 95%; ">
					<div id='chart1' style="height:80%;"></div>
					<!--div style="height:10%;    display: flex; flex-direction: column; flex-basis: 100%; flex: 1; " id='legend1'></div-->
				</div>
				<div style="top:0px; position:absolute; background:white;">
					<!--div style="height:10%;" id='legend2'></div-->
					<div id='chart2'></div>
				</div>
	
			</div>

			<div style="height: 20px; padding-top:20px; padding-left:30px; padding-right:30px;">
				<slot name="slotBottom"></slot>
			</div>

			<div id="bottomLine" style="display: none; height:40px; grid-template-columns: 1fr 1fr 1fr;">
				<div>
					<slot name="slotBottomLeft"></slot>
				</div>

				<p style="justify-self: center;"><a id="sourceLink"><span tabindex="0">Dataset Source</span></a></p>

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

  	// helper
	static getHtmlTemplate(source) {
		const t = document.createElement('template')
		t.innerHTML = source
		return t.content
	}

}