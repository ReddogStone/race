var PrimitiveRenderer = (function() {
	function drawPath(context, style, path) {
		context.beginPath();
		path();

		if (style.fill) {
			context.fillStyle = style.fill;
			context.fill();
		}

		if (style.stroke) {
			context.strokeStyle = style.stroke;
			context.lineWidth = style.lineWidth;
			context.stroke();
		}
	}	

	return {
		rect: function(context, style, size) {
			drawPath(context, style, function() {
				context.rect(0, 0, size.x, size.y);
			});
		},
		circle: function(context, style, radius) {
			drawPath(context, style, function() {
				context.arc(radius, radius, radius, 0, 2 * Math.PI);
			});
		},
		triangle: function(context, style, size) {
			drawPath(context, style, function() {
				context.moveTo(0, 0);
				context.lineTo(size.x, 0.5 * size.y);
				context.lineTo(0, size.y);
				context.closePath();
			});
		}
	};
})();
