var SpeedToken = (function() {
	var ACTIVE_STYLE = {
		stroke: SPEED_TOKEN_STYLE.stroke,
		fill: SPEED_TOKEN_STYLE.active,
		lineWidth: SPEED_TOKEN_STYLE.lineWidth
	};

	var INACTIVE_STYLE = {
		stroke: SPEED_TOKEN_STYLE.stroke,
		fill: SPEED_TOKEN_STYLE.inactive,
		lineWidth: SPEED_TOKEN_STYLE.lineWidth
	};

	return {
		render: function(context, size, active) {
			PrimitiveRenderer.roundedRect(context, active ? ACTIVE_STYLE : INACTIVE_STYLE, size, size.y * 0.1);
		}
	};
})();