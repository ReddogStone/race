var KeyDisplay = (function() {
	return {
		render: function(context, key) {
			var size = KEY_DISPLAY_STYLE.size;

			context.fillStyle = KEY_DISPLAY_STYLE.fill;
			context.strokeStyle = KEY_DISPLAY_STYLE.stroke;
			context.lineWidth = KEY_DISPLAY_STYLE.lineWidth;

			context.beginPath();
			context.rect(-size * 0.5, -size * 0.5, size, size);
			context.fill();
			context.stroke();

			renderString(context, key, KEY_DISPLAY_STYLE.textSize, MAIN_FONT, KEY_DISPLAY_STYLE.stroke);
		}
	};
})();