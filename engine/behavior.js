var Behavior = (function() {
	function twoParallel(behavior1, behavior2) {
		var done1 = false;
		var done2 = false;
		return function(event) {
			if (!done1) {
				var res = behavior1(event);
				done1 = res.done;
				if (done2) { return res; }
			}
			if (!done2) {
				var res = behavior2(event);
				done2 = res.done;
				if (done1) { return res; }
			}

			return { done: false };
		};
	}

	function interval(duration, update) {
		var t = 0;
		update(0);
		return function(event) {
			if (event.type !== 'update') { return { done: false }; }

			var result = { done: false };

			t += event.dt;
			if (t >= duration) {
				t = duration;
				result = {
					done: true,
					pass: { type: 'update', dt: t - duration }
				};
			}

			update(t / duration);

			return result;
		};
	}	

	return {
		run: function(generatorFunc) {
			var gen = generatorFunc();

			var res = gen.next();
			if (res.done) {
				return function() { return { done: true }; };
			}

			var current = res.value;
			return function(event) {
				var res = current(event);
				while (res.done) {
					var res = gen.next(res.value);
					if (res.done) { return res; }

					current = res.value;
					if (res.pass) {
						res = current(res.pass);
					} else {
						res = { done: false };
					}
				}

				return { done: false };
			};
		},
		input: function() {
			return function(event) {
				if (event.type !== 'update') {
					return { done: true, value: event };
				}
				return { done: false };
			};
		},
		mouseDown: function() {
			return function(event) {
				if (event.type === 'mousedown') {
					return { done: true, value: event.pos };
				}
				return { done: false };
			};
		},
		parallel: function(behaviors) {
			if (!Array.isArray(behaviors)) {
				behaviors = Array.prototype.slice.call(arguments);
			}

			if (behaviors.length === 0) {
				return function() { return { done: true, remaining: 0 }; };
			}

			return behaviors.reduce(twoParallel);
		},
		first: function(b1, b2) {
			return function(event) {
				var res = b1(event);
				if (res.done) { return res; }

				var res = b2(event);
				if (res.done) { return res; }

				return { done: false };
			};
		},
		interval: interval,
		wait: function(duration) {
			return interval(duration, function() {});
		},
		performTask: function(task) {
			var finished = false;

			task(function(error) {
				if (error) { throw error; }
				finished = true;
			});

			return function() {
				return { done: finished };
			};
		}		
	};
})();