var KeyDisplay = (function() {
	return {
		render: function(context, key, size, highlighted) {
			var stroke = highlighted ? KEY_DISPLAY_STYLE.highlighted : KEY_DISPLAY_STYLE.stroke;

			var style = {
				fill: KEY_DISPLAY_STYLE.fill,
				stroke: stroke,
				lineWidth: KEY_DISPLAY_STYLE.lineWidth
			};

			PrimitiveRenderer.roundedRect(context, style, vec(size, size), size * 0.2);

			renderTranslated(context, size * 0.5, size * 0.5, function(context) {
				StringRenderer.render(context, key, KEY_DISPLAY_STYLE.relativeTextSize * size, MAIN_FONT, stroke);
			});
		}
	};
})();