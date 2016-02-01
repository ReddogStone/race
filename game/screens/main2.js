var MainScreen = function(level) {
	var map = level.map;
	var mapSlice = MapSlice();

	var w = 1280;
	var h = 720;
	var viewport = rcoords(0, 0, w, h);
	var offset = vec(0.5 * w, 0.5 * h);

	var MIN_PULL_LENGTH = 0.3;
	var MAX_HOOK_LENGTH = 1;
	var PULL_FORCE = 2;
	var GRAVITY = vec(0, 0.5);
	var HOOK_SPEED = 5;

	var startPos = MapLogic.getStart(map);

	var player = {
		pos: vclone(startPos),
		lastPos: vclone(startPos),
		hook: vadd(startPos, vec(0.05, 0)),
		radius: 0.05,
		style: PLAYER_STYLE
	};

	function toWorldSpace(player, p) {
		return vadd(vscale(vsub(p, offset), 1 / MAP_CELL_SIZE), player.pos);
	}

	var getMouseEvent = Behavior.filter(function(event) { return (['mousemove', 'mousedown'].indexOf(event.type) >= 0) });

	function getHookPos(player, mousePos) {
		var worldPos = toWorldSpace(player, mousePos);
		var dir = vnorm(vsub(worldPos, player.pos));
		return vadd(player.pos, vscale(dir, player.radius * 1.2));
	}

	function collide(from, to) {
		// var limit = -0.25;
		// if (to.y < limit) {
		// 	return vec(Math.lerp(from.x, to.x, 0.95), limit);
		// }

		// var limit = 0.25;
		// if (to.y > limit) {
		// 	return vec(Math.lerp(from.x, to.x, 0.95), limit);
		// }

		var cellPos = MapLogic.getCellCoords(from);
		var delta = vsub(to, from);
		var roadWidth = 0.5 * MAP_ROAD_SIZE / MAP_CELL_SIZE;

		var RESTITUTION = 0.95;

		var yLimit = cellPos.y + Math.sign(delta.y) * roadWidth;
		var alpha = (yLimit - from.y) / (to.y - from.y);
		if ((alpha >= 0) && (alpha <= 1)) {
			var xInter = Math.lerp(from.x, to.x, alpha);
			var xRel = xInter - Math.round(xInter);
			if ((xRel < -roadWidth) || (xRel > roadWidth) || !MapLogic.canGo(map, cellPos, vec(0, Math.sign(delta.y)))) {
				return vec(Math.lerp(from.x, to.x, RESTITUTION), yLimit);
			}
		}

		var xLimit = cellPos.x + Math.sign(delta.x) * roadWidth;
		var alpha = (xLimit - from.x) / (to.x - from.x);
		if ((alpha >= 0) && (alpha <= 1)) {
			var yInter = Math.lerp(from.y, to.y, alpha);
			var yRel = yInter - Math.round(yInter);
			if ((yRel < -roadWidth) || (yRel > roadWidth) || !MapLogic.canGo(map, cellPos, vec(Math.sign(delta.x), 0))) {
				return vec(xLimit, Math.lerp(from.y, to.y, RESTITUTION));
			}
		}
	}

	function waitForHookThrow() {
		return Behavior.first(
			Behavior.run(function*() {
				while (true) {
					var event = yield Behavior.type('mousemove');
					player.hook = getHookPos(player, event.pos);
				}
			}),
			Behavior.type('mousedown')
		);
	}

	function waitForHookGrip() {
		var hookDir = vnorm(vsub(player.hook, player.pos));
		var l = player.radius;

		return Behavior.first(
			Behavior.update(function(dt) {
				l += dt * HOOK_SPEED;
				if (l > MAX_HOOK_LENGTH) {
					return false;
				}

				var hookPos = vadd(player.pos, vscale(hookDir, l));

				var collisionPos = collide(player.hook, hookPos);
				if (collisionPos) {
					player.hook = collisionPos;
					return true;
				}

				player.hook = hookPos;
			}),
			Behavior.type('mouseup')
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
				player.hook = getHookPos(player, event.pos);

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
			player.pos = vadd(vadd(player.pos, vsub(player.pos, player.lastPos)), vscale(GRAVITY, dt * dt));
			player.lastPos = lastPos;

			var collisionPos = collide(lastPos, player.pos);
			if (collisionPos) {
				player.pos = collisionPos;
			}

			if (!player.grip) {
				player.hook = vadd(player.pos, vsub(player.hook, lastPos));
			}

			if (MapLogic.isFinish(MapLogic.getCell(map, player.pos))) {
				console.log('FINISH');
				return true;
			}
		})
	)

	return function(event) {
		if (event.type !== 'show') {
			var result = mainBehavior(event);
			if (result.done) {
				return result;
			}
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