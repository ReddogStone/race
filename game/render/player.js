var PlayerRenderer = (function() {

	function setupStyle(context, style) {
		context.fillStyle = style.fill;
		context.strokeStyle = style.stroke;
	}

	function renderPlayer(context, pivotX, pivotY, style, render) {
		setupStyle(context, style);
		context.lineWidth = PLAYER_GEOMETRY.lineWidth;

		var sx = PLAYER_GEOMETRY.size * PLAYER_GEOMETRY.assymetry;
		var sy = PLAYER_GEOMETRY.size;

		context.translate(-pivotX * sx, -pivotY * sy);
		render(context, sx, sy);
		context.translate(pivotX * sx, pivotY * sy);
	}

	return {
		forMap: function(context, pivotX, pivotY, style) {
			renderPlayer(context, pivotX, pivotY, style, function(context, sx, sy) {
				PrimitiveRenderer.roundedRect(context, style, vec(sx, sy), sy * 0.1);
			});
		},
		withSpeedBar: function(context, pivotX, pivotY, style, speedPercentage) {
			renderPlayer(context, pivotX, pivotY, style, function(context, sx, sy) {
				PrimitiveRenderer.roundedRect(context, style, vec(sx, sy), sy * 0.2);

/*				context.fillStyle = SPEED_BAR_STYLE.fill;
				context.beginPath();
				context.rect(0, 0, sx * speedPercentage, sy);
				context.fill();
				context.stroke(); */
			});
		},
		forMinimap: function(context, style) {
			setupStyle(context, style);
			context.lineWidth = MINIMAP_STYLE.lineWidth;

			context.beginPath();

			context.arc(0, 0, MINIMAP_STYLE.dotRadius, 0, 2 * Math.PI);

			context.fill();
			context.stroke();
		}
	};
})();
