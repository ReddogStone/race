var PlayerRenderer = (function() {

	function setupStyle(context, style) {
		context.fillStyle = style.fill;
		context.strokeStyle = style.stroke;
	}

	return {
		forMap: function(context, pivotX, pivotY, style) {
			setupStyle(context, style);
			context.lineWidth = PLAYER_GEOMETRY.lineWidth;

			context.beginPath();

			var sx = PLAYER_GEOMETRY.size * PLAYER_GEOMETRY.assymetry;
			var sy = PLAYER_GEOMETRY.size;
			context.translate(-pivotX * sx, -pivotY * sy);
			context.rect(-0.5 * sx, -0.5 * sy, sx, sy);
			context.translate(pivotX * sx, pivotY * sy);

			context.fill();
			context.stroke();
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
