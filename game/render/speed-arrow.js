var SpeedArrow = (function() {
	var OFFSET = 1;
	var ARROW_MIDDLE_OFFSET = 0.3;

	var LINE_WIDTH = WIN_BG_STYLE.lineWidth / MAP_CELL_SIZE;
	var FREQUENCY = 3;
	var STYLES = [
		{ fill: SPEED_ARROW_STYLE.fill1, stroke: SPEED_ARROW_STYLE.stroke1, lineWidth: LINE_WIDTH },
		{ fill: SPEED_ARROW_STYLE.fill2, stroke: SPEED_ARROW_STYLE.stroke2, lineWidth: LINE_WIDTH }
	];

	return {
		render: function(context, size) {
			var style1 = STYLES[0];
			var style2 = STYLES[1];
			if (Time.now() % 0.5 > 0.25) {
				style1 = STYLES[1];
				style2 = STYLES[0];
			}

			var arrowSize = vmul(size, vec(1 / (1 + 2 * OFFSET), 1));
			var render1 = PrimitiveRenderer.triangleArrow.bind(null, context, ARROW_MIDDLE_OFFSET, style1, arrowSize);
			var render2 = PrimitiveRenderer.triangleArrow.bind(null, context, ARROW_MIDDLE_OFFSET, style2, arrowSize);;

			renderTranslated(context, arrowSize.x * OFFSET * 2, 0, render1);
			renderTranslated(context, arrowSize.x * OFFSET, 0, render2);
			renderTranslated(context, 0, 0, render1);
		}
	};
})();