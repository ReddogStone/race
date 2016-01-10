function renderTranslated(context, x, y, render) {
	context.translate(x, y);
	render(context);
	context.translate(-x, -y);
}

function renderTransformed(context, x, y, rot, uniformScale, render) {
	context.save();

	context.translate(x, y);
	context.rotate(rot);
	context.scale(uniformScale, uniformScale);

	render(context);

	context.restore();
}
