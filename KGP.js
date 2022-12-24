setTimeout(() => {
	initKGP();
}, 201 + Math.max(- Date.now() + game.timer.timestampStart, -200));

function initKGP() {
	if (localStorage['zh.kgp.enable'] !== 'disable' && !window.KGPInterval) {
		if (game.resPool) {
			window.KGPInterval = setInterval(() => initKGPLeftColumn(), 200);
			$('<style type="text/css" id="KGPBorder">.res-table { border-spacing: 0px 3px; }</style>').appendTo('head');
		} else {
			setTimeout(() => initKGP(), 500);
		}
	} else {
		if (KGPInterval) {
			clearInterval(KGPInterval);
			window.KGPInterval = undefined;
			initKGPLeftColumn(false);
			document.getElementById("KGPBorder").remove();
		}
	}
}

function initKGPLeftColumn(enable = true) {
	// var $column = $("#leftColumnViewport");
	// var $rows = $column.find('.res-row');
	const $rows = $("#leftColumnViewport > div > div:nth-child(1) > div:nth-child(2) > div").find('.res-row');
	const resMap = KGP.resMap;
	$rows.each(function (index, item) {
		if (!enable) {
			return item.removeAttribute('style');
		}

		let name = item.className.split(' ')[1].substring(9);
		if (name === 'kittens' || name === 'zebras') {return;}
		let $row = $(item);
		let res = resMap[name];
		if (res) {
			let maxAmount = res.maxValue;
			let currentAmount = res.value;
			KGP.changeCSS(currentAmount, maxAmount, $row);
		}
	});
	KGP.updateTooltip();
}

window.KGP = {
	resMap : game.resPool.resourceMap,
	resRow : undefined,
	tool : undefined,
	updateTooltip: function () {
		let resMap = this.resMap;
		if (game.tooltipUpdateFunc) {
			let updateFunc = game.tooltipUpdateFunc;
			let tool = $('#tooltip').find('.price-block');
			if (!updateFunc.length) {
				game.tooltipUpdateFunc = (one) => {
					updateFunc();
					KGP.updateTooltip();
				};
			}
			tool.each((index, item) => {
				let text = item.textContent;
				let replaceText = text.replace('/', '');
				if (replaceText !== text) {
					let $row = $(item);
					replaceText = replaceText.replace('*', ' ');
					replaceText = replaceText.replace('+', ' ');
					let array = replaceText.trim().split(' ');
					let mixedText = array[0];
					let textLength = mixedText.length;
					let currentAmount, name;
					for (let i = 0; i < textLength; i++) {
						if (parseFloat(mixedText[i]) + 1) {
							name = mixedText.substring(0, i);
							currentAmount = mixedText.substring(i, textLength);
							break;
						}
					}
					let maxAmount = KGP.getAmountFromFormatted(array[2]);
					currentAmount = KGP.getAmountFromFormatted(currentAmount);
					if (array.length < 4) {
						let noRes, antimatterProduction, relicPerDay;
						switch (name) {
							case '眼泪':
								noRes = $row.find('.noRes');
								noRes.text((index, oldVal) => {
									let time = Math.ceil((maxAmount - currentAmount) / game.bld.getBuildingExt('ziggurat').meta.on) * 2500;
									let unicornTick = resMap['unicorns'].perTickCached;
									if (time - resMap['unicorns'].value > 0 && unicornTick) {
										time = (time - resMap['unicorns'].value) / (game.getTicksPerSecondUI() * unicornTick);
										return oldVal + ' (' + game.toDisplaySeconds(time) + ')';
									}
								});
								break;
							case '反物质':
								antimatterProduction = game.getEffect('antimatterProduction');
								if (maxAmount <= resMap['antimatter'].maxValue && antimatterProduction) {
									noRes = $row.find('.noRes');
									noRes.text((index, oldVal) => {
										let time = Math.ceil((maxAmount - currentAmount) / antimatterProduction);
										return oldVal + ' (' + time + '游戏年)';
									});
								}
								break;
							case '遗物':
								relicPerDay = game.getEffect("relicPerDay");
								if (relicPerDay) {
									noRes = $row.find('.noRes');
									noRes.text((index, oldVal) => {
										let isAccelerated = game.time.isAccelerated ? 1.33 : 2;
										let time = Math.ceil((maxAmount - currentAmount) / relicPerDay) * isAccelerated;
										return oldVal + ' (' + game.toDisplaySeconds(time) + ')';
									});
								}
								break;
						}
					}

					KGP.changeCSS(currentAmount, maxAmount, $row);
				}
			});
		}
	},
	changeCSS : function (current, limit, $row) {
		if (limit > 0 && current > 0) {
			let percentage = (100 * current) / limit; // #1

			$row.css('background-repeat', 'no-repeat');
			$row.css('background-position', 'bottom left');
			$row.css('background-size', Math.min(200, percentage) + '% 1px');// #3

			if (percentage > 95) {
				$row.css('background-image', 'linear-gradient(0, red, red)');
			} else if (percentage > 75) {
				$row.css('background-image', 'linear-gradient(0, orange, orange)');
			} else {
				$row.css('background-image', 'linear-gradient(0, green, green)');
			}
		}
	},
	// getAmountLeftColumn : function ($cell) {
	// 	if ($cell.length === 0) {
	// 		return 0;
	// 	}
	//
	// 	const cellContent = $cell.text().replace('/', '')
	//
	// 	return this.getAmountFromFormatted(cellContent);
	// },
	getAmountFromFormatted : function (formatted) {
		if (!formatted) {return 0;}
		const unit = formatted.slice(-1);

		const noUnit = !isNaN(Number(unit));// #4

		const amount = noUnit ? Number(formatted) : Number(formatted.substring(0, formatted.length - 1));

		if (noUnit) {
			return amount;
		}

		switch (unit) {
			case 'K':
				return amount * 1e3;
			case 'M':
				return amount * 1e6;
			case 'G':
				return amount * 1e9;
			case 'T':
				return amount * 1e12;
			case 'P':
				return amount * 1e15;
			default:
				return 0;
		}
	},
};

// (() => {
// 	KGP.resTitleMap = {};
// 	let resources = game.resPool.resources;
// 	for (let i = game.resPool.resources.length - 1; i >= 0; i--) {
// 		let res = resources[i];
// 		let title = res.title;
// 		KGP.resTitleMap[title] = res;
// 	}
// })();
// $('#tooltip').find('price-block')
// $('#tooltip').find('.price-block')[1].outerText