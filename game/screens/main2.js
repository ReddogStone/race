var MainScreen = function(level) {
	var map = level.map;
	var mapSlice = MapSlice();

	var w = 1280;
	var h = 720;
	var viewport = rcoords(0, 0, w, h);
	var offset = vec(0.5 * w, 0.5 * h);

	var MIN_PULL_LENGTH = 0.3;
	var MAX_HOOK_LENGTH = 4;
	var PULL_FORCE = 0.5;
	var GRAVITY = vec(0, 0);
	var HOOK_SPEED = 5;

	var startPos = MapLogic.getStart(map);

	var player = {
		pos: vclone(startPos),
		lastPos: vclone(startPos),
		hook: vadd(startPos, vec(0.05, 0)),
		radius: 0.4,
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

	function intersectRay(start, dir, l) {
		var result = 0;

		var current = vclone(start);
		var currentTile = vmap(current, Math.round);
		var step = vmap(dir, Math.sign);

		while (result < l) {
			if (MapLogic.isWall(MapLogic.getCell(map, currentTile))) {
				return {
					alpha: result,
					tile: currentTile
				};
			}

			var delta = vsub(vadd(currentTile, vscale(step, 0.5)), current);
			var alphas = vdiv(delta, dir);

			if (alphas.x < alphas.y) {
				current = vadd(current, vscale(dir, alphas.x));
				currentTile.x += step.x;
				result += alphas.x;
			} else if (alphas.y < alphas.x) {
				current = vadd(current, vscale(dir, alphas.y));
				currentTile.y += step.y;
				result += alphas.y;
			} else {
				current = vadd(current, vscale(dir, alphas.x));
				currentTile = vadd(currentTile, step);
				result += alphas.x;
			}
		}

		return {
			alpha: result
		};
	}

	function collideWithTile(tile, start, dir, l, radius) {
		var step = vmap(dir, Math.sign);
		var corner = vsub(tile, vscale(step, 0.5 + radius));
		var delta = vsub(corner, start);

		var alphas = vflip(vdiv(delta, dir));

		var inter = vadd(start, vmul(alphas, dir));

		if ((alphas.x <= l) && (Math.abs(inter.x - tile.x) < 0.5 + radius)) {
			return {
				pos: vec(inter.x, start.y + delta.y),
				normal: vec(0, -step.y)
			};
		} else if ((alphas.y <= l) && (Math.abs(inter.y - tile.y) < 0.5 + radius)) {
			return {
				pos: vec(start.x + delta.x, inter.y),
				normal: vec(-step.x, 0)
			};
		}
	}

	function collide(from, to, radius) {
		if (veq(from, to)) { return; }

		var delta = vsub(to, from);
		var l = vlen(delta);
		var dir = vscale(delta, 1 / l);
		var off1 = vscale(vec(dir.y, -dir.x), radius);
		var off2 = vscale(vec(-dir.y, dir.x), radius);

		var inter1 = intersectRay(vadd(from, off1), dir, l + 2 * radius);
		var inter2 = intersectRay(vadd(from, off2), dir, l + 2 * radius);

		var minInter = inter1.alpha < inter2.alpha ? inter1 : inter2;
		if (minInter.alpha <= l + 2 * radius) {
			console.log('Collision:', minInter.tile);
			return collideWithTile(minInter.tile, from, dir, l, radius);
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

				var collision = collide(player.hook, hookPos, 0);
				if (collision) {
					player.hook = collision.pos;
					return true;
				}

				player.hook = hookPos;
			}),
			Behavior.run(function*() {
				yield Behavior.type('mouseup');
				return false;
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

	function holdPlayer() {
		var dist = vdist(player.hook, player.pos);

		return Behavior.first(
			Behavior.update(function(dt) {
				var delta = vsub(player.hook, player.pos);
				var l = vlen(delta);

				if (l > dist) {
					player.pos = vsub(player.hook, vscale(delta, dist / l));
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

					// player.pos = vlerp(player.pos, player.hook, 0.001);
					// yield holdPlayer();

					player.grip = false;
				}

				yield retractHook();
			}
		}),
		Behavior.update(function(dt) {
			var lastPos = player.pos;
			player.pos = vadd(vadd(player.pos, vsub(player.pos, player.lastPos)), vscale(GRAVITY, dt * dt));
			player.lastPos = lastPos;

			var collision = collide(lastPos, player.pos, player.radius);
			if (collision) {
				var v = vsub(collision.pos, player.lastPos);
				player.pos = collision.pos;
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