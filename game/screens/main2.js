var MainScreen = function(level) {
	var map = level.map;
	var mapSlice = MapSlice();

	var w = 1280;
	var h = 720;
	var viewport = rcoords(0, 0, w, h);
	var offset = vec(0.5 * w, 0.5 * h);

	var MAX_HOOK_LENGTH = 0.7;
	var PULL_FORCE = 1;

	var startPos = MapLogic.getStart(map);

	var player = {
		pos: vclone(startPos),
		lastPos: vclone(startPos),
		hook: vadd(startPos, vec(0.05, 0)),
		radius: 0.05,
		style: PLAYER_STYLE
	};

	function toWorldSpace(p) {
		return vadd(vscale(vsub(p, offset), 1 / MAP_CELL_SIZE), player.pos);
	}

	var getMouseEvent = Behavior.filter(function(event) { return (['mousemove', 'mousedown'].indexOf(event.type) >= 0) });

	function waitForHookThrow() {
		return Behavior.first(
			Behavior.run(function*() {
				while (true) {
					var event = yield Behavior.type('mousemove');
					var mousePos = toWorldSpace(event.pos);
					var dir = vnorm(vsub(mousePos, player.pos));
					player.hook = vadd(player.pos, vscale(dir, player.radius * 1.2));
				}
			}),
			Behavior.type('mousedown')
		);
	}

	function waitForHookGrip() {
		var hookDir = vnorm(vsub(player.hook, player.pos));
		var startLength = player.radius;

		return Behavior.first(
			Behavior.run(function*() {
				yield Behavior.first(
					Behavior.interval(0.5, function(progress) {
						var l = lerp(startLength, MAX_HOOK_LENGTH, progress);
						player.hook = vadd(player.pos, vscale(hookDir, l));
					}),
					Behavior.type('mouseup')
				);
				return false;
			}),
			Behavior.update(function(dt) {
				if ((player.hook.y < 1.75) || (player.hook.y > 2.25)) {
					return true;
				}
			})
		);
	}

	function retractHook() {
		var hook = vclone(player.hook);
		return Behavior.interval(0.2, function(progress) {
			player.hook = vlerp(hook, player.pos, progress);
		});
	}

	function pullPlayer() {
		return Behavior.first(
			Behavior.update(function(dt) {
				var delta = vsub(player.hook, player.pos);
				var l = vlen(delta);
				var step = dt * dt * PULL_FORCE;

				if (l < step) {
					player.pos = vclone(player.hook);
				} else if (l > MAX_HOOK_LENGTH) {
					player.pos = vsub(player.hook, vscale(delta, (MAX_HOOK_LENGTH - step) / l));
				} else {
					player.pos = vadd(player.pos, vscale(delta, step / l));
				}
			}),
			Behavior.type('mouseup')
		);
	}

	var mainBehavior = Behavior.first(
		Behavior.run(function*() {
			while (true) {
				var event = yield waitForHookThrow();

				player.grip = yield waitForHookGrip();

				if (player.grip) {
					yield pullPlayer();
					player.grip = false;
				}

				yield retractHook();
			}
		}),
		Behavior.update(function(dt) {
			var lastPos = player.pos;
			player.pos = vadd(player.pos, vsub(player.pos, player.lastPos));
			player.lastPos = lastPos;

			if (!player.grip) {
				player.hook = vadd(player.pos, vsub(player.hook, lastPos));
			}

			player.pos.y = Math.min(Math.max(player.pos.y, 1.75), 2.25);
		})
	)

	return function(event) {
		if (event.type !== 'show') {
			var result = mainBehavior(event);
			// if (result.done) {
			// 	return result;
			// }
		} else {
			var context = event.context;
			var canvas = context.canvas;

			var pos = player.pos;

			var delta = vscale(vsub(offset, viewport), 1 / MAP_CELL_SIZE);
			var topLeft = vsub(pos, delta);
			var bottomRight = vadd(pos, delta);

			var left = Math.floor(topLeft.x);
			var top = Math.floor(topLeft.y);
			var right = Math.ceil(bottomRight.x) + 1;
			var bottom = Math.ceil(bottomRight.y) + 1;

			CameraRenderer.viewport(context, viewport.x, viewport.y, viewport.sx, viewport.sy, function(context) {
				renderTranslated(context, offset.x, offset.y, function(context) {
					CameraRenderer.transform(context, pos, 0, MAP_CELL_SIZE, function(context) {
						renderTranslated(context, left, top, function(context) {
							PrimitiveRenderer.rect(context, { fill: MAP_STYLE.bg }, vec(right - left, bottom - top));
						});

						var mapSize = MapLogic.getSize(map);
						mapSlice.render(context, map, left, top, right, bottom);

						var r = player.radius;
						renderTranslated(context, pos.x, pos.y, function(context) {
							var hook = vsub(player.hook, player.pos);

							context.strokeStyle = player.style.stroke;
							context.lineWidth = player.style.lineWidth;
							context.beginPath();
							context.moveTo(0, 0);
							context.lineTo(hook.x, hook.y);
							context.stroke();

							var hookR = 0.2 * r;
							renderPivotTransformed(context, hook.x, hook.y, 0, 1, hookR, hookR, function(context) {
								PrimitiveRenderer.circle(context, player.style, hookR);
							});

							renderPivotTransformed(context, 0, 0, 0, 1, r, r, function(context) {
								PrimitiveRenderer.circle(context, player.style, r);
							});
						});
					});
				});
			});
		}
	};	
}