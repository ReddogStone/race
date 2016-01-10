function draw(context, pos, scale, rot, style, path) {
	context.save();

	context.translate(pos.x, pos.y);
	context.rotate(rot);
	context.scale(scale.x, scale.y);

	context.beginPath();

	path(context);

	if (style.fill) {
		context.fillStyle = style.fill;
		context.fill();
	}
	if (style.stroke) {
		context.strokeStyle = style.stroke;
		context.lineWidth = style.lineWidth || 1;
		context.stroke();
	}

	context.restore();
}

function renderRect(context, entity) {
	var pos = entity.pos;
	if (!pos) { return; }

	var rect = entity.rect;
	var style = entity.style || { fill: 'white', stroke: 'black', lineWidth: 1 };
	var scale = entity.scale || vec(1, 1);
	var rot = entity.rotation || 0;

	var width = rect.width;
	var height = rect.height;

	var anchor = rect.anchor || vec(0, 0);

	draw(context, pos, scale, rot, style, function(context) {
		context.translate(-anchor.x * width, -anchor.y * height);
		context.rect(0, 0, width, height);
	});
}

function renderCircle(context, entity) {
	var pos = entity.pos;
	if (!pos) { return; }

	var scale = entity.scale || vec(1, 1);
	var rot = entity.rotation || 0;

	draw(context, pos, scale, rot, style, function(context) {
		context.arc(0, 0, 1, 0, 2 * Math.PI);
	});
}
