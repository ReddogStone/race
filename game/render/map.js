function renderMap(context, map, left, top, right, bottom, renderCell) {
	context.translate(left, top);
	for (var y = top; y < bottom; y++) {
		var row = map[y] || '';

		for (var x = left; x < right; x++) {
			renderCell(context, row[x], x, y, map);
			context.translate(1, 0);
		}
		context.translate(left - right, 1);
	}			

	context.translate(-left, -bottom);
}
