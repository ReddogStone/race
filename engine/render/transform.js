function renderTranslated(context, x, y, render) {
	context.translate(x, y);
	render(context);
	context.translate(-x, -y);
}

function renderTransformed(context, x, y, rot, scale, render) {
	if (typeof scale !== 'object') {
		scale = vec(scale, scale);
	}

	context.save();

	context.translate(x, y);
	context.rotate(rot);
	context.scale(scale.x, scale.y);

	render(context);

	context.restore();
}

function renderPivotTransformed(context, x, y, rot, scale, pivotX, pivotY, render) {
	if (typeof scale !== 'object') {
		scale = vec(scale, scale);
	}

	context.save();

	context.translate(x, y);
	context.rotate(rot);
	context.scale(scale.x, scale.y);
	context.translate(-pivotX, -pivotY);

	render(context);

	context.restore();
}
