var CameraRenderer = (function() {
	return {
		viewport: function(context, x, y, sx, sy, render) {
			context.save();

			context.beginPath();
			context.rect(x, y, sx, sy);
			context.clip();

			render(context);

			context.restore();
		},
		transform: function(context, pos, rot, uniformScale, render) {
			context.save();

			context.rotate(-rot);
			context.scale(uniformScale, uniformScale);
			context.translate(-pos.x, -pos.y);

			render(context);

			context.restore();
		}
	};
})();