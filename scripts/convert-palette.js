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

var result = 'var PALETTE = {\n' +
	getColorString('primary', palette.slice(0, 5)) + ',\n' +
	getColorString('secondary', palette.slice(0, 5)) + ',\n' +
	getColorString('tertiary', palette.slice(0, 5)) + ',\n' +
	getColorString('complement', palette.slice(0, 5)) + '\n};';

fs.writeFileSync(path.join('game', 'palette.js'), result);
