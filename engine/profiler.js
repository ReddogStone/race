var FrameProfiler = (function() {
	var g_averages = {};
	var g_frameTimes = {};
	var g_times = [];
	var g_timeStack = [];
	var g_level = 0;
	
	function startFrame() {
		g_frameTimes = {};
		g_times.length = 0;
	};
	function stopFrame() {
		var nameStack = [];
		var level = -1;
		for (var i = 0; i < g_times.length; ++i) {
			var current = g_times[i];
			nameStack.splice(nameStack.length - level + current.level - 1, level - current.level + 1);
			level = current.level;
			nameStack.push(current.name);
			
			var name = nameStack.join('.');
			var duration = current.stop - current.start;
			if (g_frameTimes[name]) {
				g_frameTimes[name] += duration;
			} else {
				g_frameTimes[name] = duration;
			}
		}
		
		for (var name in g_frameTimes) {
			if (name in g_averages) {
				g_averages[name] = 0.95 * g_averages[name] + 0.05 * g_frameTimes[name];
			} else {
				g_averages[name] = g_frameTimes[name];
			}
		}
	};
	function start(name) {
		var newTime = {name: name, level: g_level, start: window.performance.now()};
		g_times.push(newTime);
		g_timeStack.push(newTime);
		++g_level;
	};
	function stop() {
		--g_level;
		var time = g_timeStack.pop();
		time.stop = window.performance.now();
	};
	
	function fixedLength(string, number) {
		return '            '.substr(string.length - number) + string;
	}
	
	function getReportStrings() {
		var maxLength = 0;
		for (var name in g_frameTimes) {
			if (name.length > maxLength) {
				maxLength = name.length;
			}
		}
		
		var lines = [];
		for (var name in g_frameTimes) {
			var value = g_frameTimes[name];
			var average = g_averages[name];
			lines.push(name + Array(maxLength - name.length + 4).join(' ') + '===' + 
				fixedLength(value.toFixed(2), 8) + ' ms' +
				fixedLength(average.toFixed(2), 8) + ' ms');
		}
		
		return lines;
	};

	function show(context, left, top, fontSize, color) {
		var messages = getReportStrings();

		context.font = fontSize + 'px Consolas';
		context.fillStyle = color;
		context.textAlign = 'left';
		context.textBaseline = 'top';

		var yOff = 0;
		messages.forEach(function(message) {
			context.fillText(message, left, top + yOff);
			yOff += fontSize * 1.1;
		});
	}

	function empty() {}
	var enabled = true;

	var module = {
		enable: function() {
			enabled = true;
			module.startFrame = startFrame;
			module.stopFrame = stopFrame;
			module.start = start;
			module.stop = stop;
			module.getReportStrings = getReportStrings;
			module.show = show;
		},
		disable: function() {
			enabled = false;
			module.startFrame = empty;
			module.stopFrame = empty;
			module.start = empty;
			module.stop = empty;
			module.getReportStrings = function() { return []; };
			module.show = empty;
		},
		toggle: function() {
			if (enabled) {
				module.disable();
			} else {
				module.enable();
			}
		}
	};
	
	module.disable();
	return module;
})();