var KeyDisplay = (function() {
	return {
		render: function(context, key, size, highlighted) {
			var stroke = highlighted ? KEY_DISPLAY_STYLE.highlighted : KEY_DISPLAY_STYLE.stroke;

			context.fillStyle = KEY_DISPLAY_STYLE.fill;
			context.strokeStyle = stroke;
			context.lineWidth = KEY_DISPLAY_STYLE.lineWidth;

			context.beginPath();
			context.rect(0, 0, size, size);
			context.fill();
			context.stroke();

			renderTranslated(context, size * 0.5, size * 0.5, function(context) {
				StringRenderer.render(context, key, KEY_DISPLAY_STYLE.relativeTextSize * size, MAIN_FONT, stroke);
			});
		}
	};
})();