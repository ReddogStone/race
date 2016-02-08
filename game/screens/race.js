var RaceScreen = function(behaviorSystem, level) {
	var map = level.map;
	var mapSlice = MapSlice();
	var miniMapView = MiniMapView(map);

	var w = 1280;
	var h = 720;
	var viewport = rcoords(0, 0, w, h);
	var offset = vec(0.5 * w, 0.5 * h);

	var MIN_PULL_LENGTH = 0.3;
	var MAX_HOOK_LENGTH = 4;
	var PULL_FORCE = 20;
	var GRAVITY = vec(0, 0);
	var HOOK_SPEED = 10;
	var RESTITUTION = 0.8;
	var FRICTION = 1;
	var FRICTION_CUTOFF = 0.5;
	var BASE_THRUST = 20;

	var startPos = MapLogic.getStart(map);

	function makeVertex(p) {
		return {
			pos: vclone(p),
			lastPos: vclone(p)
		};
	}

	function makeEdge(v1, v2) {
		return {
			v1: v1,
			v2: v2,
			l: vdist(v1.pos, v2.pos)
		};
	}

	var vertices = [
		vclone(startPos),
		vadd(startPos, vec(-0.3, -0.15)),
		vadd(startPos, vec(-0.3, 0.15)),
		vadd(startPos, vec(0.12, 0.1)),
		vadd(startPos, vec(0.12, -0.1))
	].map(makeVertex);

	var edges = [
		makeEdge(vertices[1], vertices[2]),
		makeEdge(vertices[2], vertices[3]),
		makeEdge(vertices[3], vertices[4]),
		makeEdge(vertices[4], vertices[1]),

		makeEdge(vertices[1], vertices[3]),
		makeEdge(vertices[2], vertices[4]),

		makeEdge(vertices[1], vertices[0]),
		makeEdge(vertices[2], vertices[0]),
		// makeEdge(vertices[3], vertices[0]),
		// makeEdge(vertices[4], vertices[0]),
	];

	var player = {
		vertices: vertices,
		edges: edges,

		// pos: vclone(startPos),
		// lastPos: vclone(startPos),

		thrust: 0,
		dir: vec(1, 0),

		hook: vadd(startPos, vec(0.05, 0)),
		radius: 0.05,
		style: PLAYER_STYLE,

		name: getString('you_player_name'),

		get pos() {
			return this.vertices[0].pos;
		},
		set pos(value) {
			this.vertices[0].pos = value;
		}
	};

	var particles = [];

	var startTime = 0;

	function toWorldSpace(center, p) {
		return vadd(vscale(vsub(p, offset), 1 / MAP_CELL_SIZE), center);
	}

	var getMouseEvent = Behavior.filter(function(event) { return (['mousemove', 'mousedown'].indexOf(event.type) >= 0) });

	function getHookPos(player, mousePos) {
		var worldPos = toWorldSpace(player.pos, mousePos);
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
				var dir = vdir(player.pos, player.hook);
				player.acceleration = vadd(player.acceleration, vscale(dir, PULL_FORCE));
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

	function createParticle(player) {
		var particle = {
			alpha: 1,
			pos: vclone(player.pos)
		};
		particles.push(particle);

		var start = vclone(player.pos);
		var deviation = vscale(vsub(vec(Math.random(), Math.random()), vec(0.5, 0.5)), 0.3);
		var finish = vadd(player.pos, deviation);

		behaviorSystem.add(Behavior.run(function*() {
			yield Behavior.interval(1, function(progress) {
				particle.alpha = 1 - progress;
				particle.pos = vlerp(start, finish, progress);
			});
			particles.splice(particles.indexOf(particle), 1);
		}));
	}

	function createAccelerationParticles(player) {
		return Behavior.run(function*() {
			while (true) {
				for (var i = 0; i < 3; i++) {
					createParticle(player);
				}
				yield Behavior.wait(0.05);
			}
		});
	}

	function setAcceleration(player, pos) {
		var worldPos = toWorldSpace(player.pos, pos);
		var delta = vsub(worldPos, player.pos);
		var l = vlen(delta);
		player.dir = vnorm(delta);
		player.thrust = l;
	}

	function acceleratePlayerWithMouse() {
		return Behavior.run(function*() {
			var event = yield Behavior.type('mousedown');
			setAcceleration(player, event.pos);

			if (!startTime) {
				startTime = Time.now();
			}

			yield Behavior.first(
				createAccelerationParticles(player),
				Behavior.run(function*() {
					while (true) {
						var event = yield Behavior.type('mousemove');
						setAcceleration(player, event.pos);
					}
				}),
				Behavior.type('mouseup')
			);

			player.thrust = 0;
		});
	}

	function acceleratePlayerWithKeys() {
		return Behavior.run(function*() {
			var event = yield Behavior.type('keydown');

			var keyCode = event.keyCode;
			if (keyCode === 68) {
				player.thrust = 1;
			} else if (keyCode === 65) {
				player.thrust = -1;
			}

			if (!startTime) {
				startTime = Time.now();
			}

			yield Behavior.first(
				createAccelerationParticles(player),
				Behavior.filter(function(event) {
					return (event.type === 'keyup') && (event.keyCode === keyCode);
				})
			);

			player.thrust = 0;
		});
	}

	function hookPlayer() {
		return Behavior.run(function*() {
			while (true) {
				var event = yield waitForHookThrow();

				player.hook = getHookPos(player, event.pos);

				player.grip = yield waitForHookGrip();

				if (player.grip) {
					// yield Behavior.type('mouseup');

					yield holdPlayer();

					player.grip = false;
				}

				yield retractHook();
			}
		});		
	}

	function moveVertex(vertex, acceleration, dt) {
		var lastPos = vertex.pos;

		var v = dt > 0 ? vscale(vsub(vertex.pos, vertex.lastPos), 1 / dt) : vec(0, 0);
		var vl = vlen(v);
		var vd = vl > 0 ? vscale(v, 1 / vl) : vec(0, 0);

		vl = Math.max(vl, FRICTION_CUTOFF);

		acceleration = vsub(acceleration, vscale(vd, vl * vl * FRICTION));

		vertex.pos = vadd(vadd(vertex.pos, vsub(vertex.pos, vertex.lastPos)), vscale(acceleration, dt * dt));
		vertex.lastPos = lastPos;
	}

	function collideVertex(vertex) {
		var collision = collide(vertex.lastPos, vertex.pos, 0);
		if (collision) {
			// var v = vsub(vertex.pos, vertex.lastPos);
			// vertex.pos = collision.pos;
			// v = vscale(vsub(v, vscale(collision.normal, 2 * vdot(collision.normal, v))), RESTITUTION);
			// vertex.lastPos = vsub(vertex.pos, v);

			var delta = vsub(collision.pos, vertex.pos);
			vertex.pos = vadd(vertex.pos, vscale(collision.normal, 1.01 * vdot(delta, collision.normal)));
			vertex.pos = vlerp(vertex.lastPos, vertex.pos, RESTITUTION);

			collision = collide(vertex.lastPos, vertex.pos, 0);
			if (collision) {
				var delta = vsub(collision.pos, vertex.pos);
				vertex.pos = vadd(vertex.pos, vscale(collision.normal, 1.01 * vdot(delta, collision.normal)));
				vertex.pos = vlerp(vertex.lastPos, vertex.pos, RESTITUTION);
			}
		}
	}

	function handleEdges(edges) {
		edges.forEach(function(edge) {
			var v1 = edge.v1;
			var v2 = edge.v2;

			var middle = vscale(vadd(v1.pos, v2.pos), 0.5);
			var dir = vdir(v1.pos, v2.pos);
			v1.pos = vsub(middle, vscale(dir, 0.5 * edge.l));
			v2.pos = vadd(middle, vscale(dir, 0.5 * edge.l));
		});
	}

	var mainBehavior = Behavior.first(
		Behavior.repeat(acceleratePlayerWithMouse),
		// Behavior.repeat(hookPlayer),
		Behavior.update(function(dt) {
			// var lastPos = player.pos;

			// var v = dt > 0 ? vscale(vsub(player.pos, player.lastPos), 1 / dt) : vec(0, 0);
			// var vl = vlen(v);
			// var vd = vl > 0 ? vscale(v, 1 / vl) : vec(0, 0);

			// vl = Math.max(vl, FRICTION_CUTOFF);

			// var thrust = vscale(player.dir, player.thrust * BASE_THRUST);
			// acceleration = vsub(vadd(thrust, GRAVITY), vscale(vd, vl * vl * FRICTION));

			// if (player.grip) {
			// 	// var toHook = vdir(player.pos, player.hook);
			// 	// acceleration = vadd(acceleration, vscale(toHook, PULL_FORCE));
			// }

			// player.pos = vadd(vadd(player.pos, vsub(player.pos, player.lastPos)), vscale(acceleration, dt * dt));
			// player.lastPos = lastPos;

			// var collision = collide(lastPos, player.pos, 0);
			// if (collision) {
			// 	// var v = vsub(player.pos, player.lastPos);
			// 	// player.pos = collision.pos;
			// 	// v = vscale(vsub(v, vscale(collision.normal, 2 * vdot(collision.normal, v))), RESTITUTION);
			// 	// player.lastPos = vsub(player.pos, v);

			// 	var delta = vsub(collision.pos, player.pos);
			// 	player.pos = vadd(player.pos, vscale(collision.normal, 1.01 * vdot(delta, collision.normal)));

			// 	collision = collide(lastPos, player.pos, 0);
			// 	if (collision) {
			// 		var delta = vsub(collision.pos, player.pos);
			// 		player.pos = vadd(player.pos, vscale(collision.normal, 1.01 * vdot(delta, collision.normal)));
			// 	}
			// }

			var thrust = vscale(player.dir, player.thrust * BASE_THRUST);
			for (var i = 0; i < player.vertices.length; i++) {
				var a = (i === 0) ? thrust : vec(0, 0);
				var vertex = player.vertices[i];
				moveVertex(vertex, a, dt);
			}

			for (var i = 0; i < 10; i++) {
				handleEdges(player.edges);
			}

			player.vertices.forEach(collideVertex);

			var d1 = vsub(player.vertices[0].pos, player.vertices[1].pos);
			var d2 = vsub(player.vertices[0].pos, player.vertices[2].pos);
			var dir = vnorm(vadd(d1, d2));

			// player.dir = vnorm(vadd(d1, d2));

			if (!player.grip) {
				// player.hook = vadd(player.pos, vsub(player.hook, player.vertices[0].lastPos));
				player.hook = vsub(player.pos, vscale(vnorm(player.dir), 0.05));
			}

			if (MapLogic.isFinish(MapLogic.getCell(map, player.pos))) {
//				console.log('');
				return { win: true, player: player, time: Time.now() - startTime };
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
							renderPivotTransformed(context, 0, 0, 0, 1, hookR, hookR, function(context) {
								PrimitiveRenderer.circle(context, player.style, hookR);
							});

							// renderPivotTransformed(context, 0, 0, 0, 1, r, r, function(context) {
							// 	PrimitiveRenderer.circle(context, player.style, r);
							// });
						});

						player.edges
							.filter(function(edge, index) {
								return index < 4;
							})
							.forEach(function(edge) {
								var p1 = edge.v1.pos;
								var p2 = edge.v2.pos;

								context.strokeStyle = player.style.stroke;
								context.lineWidth = player.style.lineWidth;
								context.beginPath();
								context.moveTo(p1.x, p1.y);
								context.lineTo(p2.x, p2.y);
								context.stroke();
							});

						player.vertices
							.filter(function(vertex, index) { return (index !== 0); })
							.forEach(function(vertex) {
								renderPivotTransformed(context, vertex.pos.x, vertex.pos.y, 0, 1, r, r, function(context) {
									PrimitiveRenderer.circle(context, player.style, r);
								});
							});

						FrameProfiler.start('Particles');
						particles.forEach(function(particle) {
							var particleRadius = 0.02;
							var p = particle.pos;
							renderPivotTransformed(context, p.x, p.y, 0, 1, particleRadius, particleRadius, function(context) {
								context.globalAlpha = particle.alpha;
								PrimitiveRenderer.circle(context, player.style, particleRadius);
								context.globalAlpha = 1;
							});
						});
						FrameProfiler.stop();
					});
				});
			});

			miniMapView.render(context, [player], vec(640, 20));
		}

		return { done: false };
	};	
}