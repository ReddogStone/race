var SpeedDisplay = function() {
	var SIZE = vec(
		MAX_PLAYER_SPEED * SPEED_TOKEN_STYLE.width + (MAX_PLAYER_SPEED + 1) * SPEED_TOKEN_STYLE.margin,
		SPEED_TOKEN_STYLE.height + 2 * SPEED_TOKEN_STYLE.margin
	);

	return {
		size: function() {
			return SIZE;
		},
		render: function(context, speed, maxSpeed) {
			PrimitiveRenderer.rect(context, { stroke: SPEED_TOKEN_STYLE.stroke, fill: SPEED_TOKEN_STYLE.bg }, SIZE);

			renderTranslated(context, SPEED_TOKEN_STYLE.margin, SPEED_TOKEN_STYLE.margin, function(context) {
				var x = 0;
				for (var i = 0; i < maxSpeed; i++) {
					renderTranslated(context, x, 0, function(context) {
						SpeedToken.render(context, vec(SPEED_TOKEN_STYLE.width, SPEED_TOKEN_STYLE.height), i < speed);
					});
					x += SPEED_TOKEN_STYLE.width + SPEED_TOKEN_STYLE.margin;
				}
			});
		}
	};
};