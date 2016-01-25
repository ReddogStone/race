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
		roundedRect: function(context, style, size, r) {
			r = r || 0;
			drawPath(context, style, function() {
				context.moveTo(r, 0);
				context.lineTo(size.x - r, 0);
				context.arcTo(size.x, 0, size.x, r, r);
				context.lineTo(size.x, size.y - r);
				context.arcTo(size.x, size.y, size.x - r, size.y, r);
				context.lineTo(r, size.y);
				context.arcTo(0, size.y, 0, size.y - r, r);
				context.lineTo(0, r);
				context.arcTo(0, 0, r, 0, r);
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
		},
		triangleArrow: function(context, middleOffset, style, size) {
			drawPath(context, style, function() {
				context.moveTo(0, 0);
				context.lineTo(size.x, 0.5 * size.y);
				context.lineTo(0, size.y);
				context.lineTo(middleOffset * size.x, 0.5 * size.y);
				context.closePath();
			});
		}
	};
})();
