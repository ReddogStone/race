var MouseInputArea = function(pos, size, anchor) {
	function inside(point) {
		var p = vadd(vdiv(vsub(point, pos), size), anchor);
		return (p.x >= 0) && (p.y >= 0) && (p.x <= 1) && (p.y <= 1);
	}

	return function(onStateChanged) {
		var isDown = false;
		var isHighlighted = false;

		var state = MouseInputArea.DEFAULT;
		function notifyState() {
			var newState = MouseInputArea.DEFAULT;
			if (isHighlighted) {
				newState = isDown ? MouseInputArea.PRESSED : MouseInputArea.HIGHLIGHTED;
			}

			if (newState !== state) {
				state = newState;
				onStateChanged(newState);
			}
		}

		function setDown(value) {
			isDown = value;
			notifyState();
		}

		function setHighlighted(value) {
			isHighlighted = value;
			notifyState();
		}

		return Behavior.first(
			Behavior.run(function*() {
				while(true) {
					var event = yield Behavior.type('mousemove');
					setHighlighted(inside(event.pos));
				}
			}),
			Behavior.run(function*() {
				var clicked = false;
				while (!clicked) {
					var event = yield Behavior.type('mousedown');
					if (inside(event.pos)) {
						setDown(true);

						var event = yield Behavior.type('mouseup');
						clicked = inside(event.pos);
						setDown(false);
					}
				}
			})
		);
	};
};

MouseInputArea.DEFAULT = 'default';
MouseInputArea.HIGHLIGHTED = 'highlighted';
MouseInputArea.PRESSED = 'pressed';
