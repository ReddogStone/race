var fs = require('fs');
var path = require('path');

var paletteText = fs.readFileSync(path.join('scripts', 'palette.txt'), 'utf-8');

var lines = paletteText.split(/\r\n|\r|\n/);
lines = lines.map(function(line) {
	return line.trim();
}).filter(function(line) {
	return !(line === '') && !line.startsWith('*') && !line.startsWith('#');
});

var palette = lines.map(function(line) {
	var parts = line.split('=').map(function(part) { return part.trim(); });
	return parts[1];
});

function getColorString(name, palette) {
	return '\t' + name + ': [' + palette.map(function(shade) { return "'" + shade + "'"; }).join(', ') + ']';
}

function getShades(palette, index) {
	return [
		palette[index + 4],
		palette[index + 3],
		palette[index],
		palette[index + 2],
		palette[index + 1]
	];
}

var result = 'var PALETTE = {\n' +
	getColorString('primary', getShades(palette, 0)) + ',\n' +
	getColorString('secondary', getShades(palette, 10)) + ',\n' +
	getColorString('tertiary', getShades(palette, 5)) + ',\n' +
	getColorString('complement', getShades(palette, 15)) + '\n};';

fs.writeFileSync(path.join('game', 'palette.js'), result);
