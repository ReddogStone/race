var Localization = function(strings, language) {
	return function(stringId /*, params */) {
		var params = Array.prototype.slice.call(arguments, 1);
		var result = strings[stringId] || 'missing text';

		if (typeof result === 'object') {
			result = result[language] || 'missing text';
		}

		params.forEach(function(param, index) {
			var regex = RegExp('\\{' + (index + 1) + '\\}', 'g');
			result = result.replace(regex, param);
		});

		return result;
	};
};