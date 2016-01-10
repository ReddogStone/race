var MainScreen = function() {
	var entities = EntitySystem();
	var behaviorSystem = BehaviorSystem();
	var renderSystem = RenderSystem({
		'sprite': renderSprite,
		'text': renderText,
		'rect': renderRect,
		'circle': renderCircle
	});

	var winRect = entities.add({
		pos: vec(640, 150),
		render: { scriptId: 'rect' },
		rect: { width: 1000, height: 400, anchor: vec(0.5, 0) },
		style: WIN_BG_STYLE,
		zOrder: 3
	});

	var youWinText = entities.add({
		pos: vec(0, 200),
		size: vec(1280, 100),
		text: {
			font: { name: 'consolas', height: 120, lineSpacing: 1.5 },
			message: ""
		},
		render: { scriptId: 'text' },
		style: { fill: 'red' },
		zOrder: 4,
		alpha: 0
	});

	var timeText = entities.add({
		pos: vec(20, 640),
		size: vec(600, 100),
		text: {
			font: { name: 'consolas', height: 50, lineSpacing: 1.5 },
			message: ""
		},
		render: { scriptId: 'text' },
		style: { fill: 'red' },
		zOrder: 4,
	});

	var map = [
		"          0---0              ",
		"          |   |   0---0      ",
		"     0----0-0 0---0   |      ",
		"     |      |         |      ",
		"X-0--0--0---0---0---0-0--0--Y",
		"  |     |       0---0 |  |   ",
		"  |     |  0----0     0--0   ",
		"  0--0  |  |                 ",
		"     0--0--0                 ",
	];

	var player = {
		mapPos: vec(0, 4),

		pos: vec(320, 360),
		rotation: 0,
		zOrder: 0,

		render: { scriptId: 'rect' },
		rect: { width: 80, height: 40, anchor: vec(0.9, 0.5) },
		style: PLAYER_STYLE,

		speed: 0,
		dir: vec(0, 0)
	};

	var player2 = {
		mapPos: vec(0, 4),

		pos: vec(960, 360),
		rotation: 0,
		zOrder: 0,

		render: { scriptId: 'rect' },
		rect: { width: 80, height: 40, anchor: vec(0.9, 0.5) },
		style: PLAYER2_STYLE,

		speed: 0,
		dir: vec(0, 0)
	};

	var gameEnded = false;
	var roundStart = 0;
	var burnedPos = null;

	function init() {
		player.mapPos = vec(0, 4);
		player.rotation = 0;
		player.speed = 0;
		player.dir = vec(0, 0);

		player2.mapPos = vec(0, 4);
		player2.rotation = 0;
		player2.speed = 0;
		player2.dir = vec(0, 0);

		youWinText.text.message = '';
		youWinText.alpha = 0;

		timeText.text.message = 'RIGHT-ARROW to start'

		gameEnded = false;
		roundStart = 0;

		winRect.alpha = 0;
	}

	init();

	behaviorSystem.add(Behavior.run(function*() {
	}));

	// behaviorSystem.add(function(event) {
	// 	if (event.type === 'update') {
	// 		player.rotation += event.dt;
	// 	}
	// 	return { done: false };
	// });

	function turn(newRotation, entity) {
		var rot = entity.rotation;

		if (Math.abs(newRotation - rot) > Math.PI) {
			rot -= 2 * Math.PI;
		}
		behaviorSystem.add(Behavior.interval(TURN_TIME, function(progress) {
			entity.rotation = lerp(rot, newRotation, progress);
		}));

		var dim = (entity.dir.x !== 0) ? 'y' : 'x';
		var start = entity.mapPos[dim];
		var end = Math.round(start);
		behaviorSystem.add(Behavior.interval(TURN_TIME, function(progress) {
			entity.mapPos[dim] = lerp(start, end, progress);
		}));
	}

	function toMiddle(duration, entity) {
		var playerPos = vclone(entity.mapPos);
		var target = vec(Math.round(playerPos.x), Math.round(playerPos.y));
		behaviorSystem.add(Behavior.interval(duration, function(progress) {
			var a = Math.sin((progress) * 0.5 * Math.PI);
			entity.mapPos = vlerp(playerPos, target, a);
		}));
	}

	function win(entity) {
		entity.dir = vec(0, 0);

		toMiddle(1, entity);

		var time = Time.now() - roundStart;

		var playerName = entity === player ? 'GREEN' : 'RED';

		youWinText.style.fill = entity.style.stroke;
		youWinText.text.message = "{{bold}}{{center}}" + playerName + " FINISHED\n" + time.toFixed(2) + 's';

		var bgw = winRect.rect.width;
		var bgh = winRect.rect.height;
		behaviorSystem.add(Behavior.interval(1, function(progress) {
			youWinText.alpha = progress;
			youWinText.text.font.height = 120 * progress;

			winRect.rect.width = progress * bgw;
			winRect.rect.height = progress * bgh;
			winRect.alpha = progress;
		}));

		gameEnded = true;

		burnedPos = null;
	}

	function getCell(map, x, y) {
		var row = map[y];
		if (!row) { return undefined; }
		return row[x];
	}

	function getTargetCell(map, pos, dir) {
		var target = vadd(pos, dir);
		return getCell(map, Math.round(target.x), Math.round(target.y));
	}

	function increaseSpeed(entity) {
		entity.speed++;
	}

	function updatePlayer(dt, entity) {
		var delta = vscale(entity.dir, dt * (PLAYER_BASE_SPEED + PLAYER_SPEED_SCALE * entity.speed));
		entity.mapPos = vadd(entity.mapPos, delta);

		var cellCoords = vec(Math.round(entity.mapPos.x), Math.round(entity.mapPos.y));
		var value = getCell(map, cellCoords.x, cellCoords.y);
		if (value === 'Y') {
			win(entity);
		}

		var dir = entity.dir;
		var mapPos = entity.mapPos;
		var targetCell = getTargetCell(map, mapPos, dir);

		var px = (mapPos.x % 1);
		var py = (mapPos.y % 1);
		if (px > 0.5) { px -= 1; }
		if (py > 0.5) { py -= 1; }
		px *= 2;
		py *= 2;
		var progress = dir.x * px + dir.y * py;
		if ((!targetCell || targetCell === ' ') && (progress > MAP_ROAD_SIZE / MAP_CELL_SIZE)) {
			toMiddle(1, entity);

			entity.burnedPos = null;

			entity.dir = vec(0, 0);
			entity.speed = 0;
		}

		var pos = vclone(entity.mapPos);
		pos.x = Math.round(pos.x);
		pos.y = Math.round(pos.y);

		if (entity.burnedPos && !veq(pos, entity.burnedPos)) {
			entity.burnedPos = null;
		}
	}

	function update(dt) {
		updatePlayer(dt, player);
		updatePlayer(dt, player2);

		if (roundStart > 0) {
			timeText.text.message = (Time.now() - roundStart).toFixed(2);
		}
	}

	function handlePlayerInput(newDir, entity) {
		var pos = vclone(entity.mapPos);
		pos.x = Math.round(pos.x);
		pos.y = Math.round(pos.y);

		if (entity.burnedPos && veq(pos, entity.burnedPos)) {
			return;
		}

		if (newDir.x * entity.dir.x === -1 || newDir.y * entity.dir.y === -1 || veq(entity.dir, newDir)) {
			return;
		}

		var targetCell = getTargetCell(map, entity.mapPos, newDir);
		if (targetCell && targetCell !== ' ') {
			entity.dir = newDir;
			turn(Math.atan2(newDir.y, newDir.x), entity);

			increaseSpeed(entity);

			if (roundStart === 0) {
				roundStart = Time.now();
			}

			entity.burnedPos = pos;
		}
	}

	function keyDown(key) {
		console.log(key);

		switch (key) {
			case 37: // left
				handlePlayerInput(vec(-1, 0), player2);
				break;
			case 38: // up
				handlePlayerInput(vec(0, -1), player2);
				break;
			case 39: // right
				handlePlayerInput(vec(1, 0), player2);
				break;
			case 40: // down
				handlePlayerInput(vec(0, 1), player2);
				break;

			case 65: // left
				handlePlayerInput(vec(-1, 0), player);
				break;
			case 87: // up
				handlePlayerInput(vec(0, -1), player);
				break;
			case 68: // right
				handlePlayerInput(vec(1, 0), player);
				break;
			case 83: // down
				handlePlayerInput(vec(0, 1), player);
				break;
		}
	}

	var miniMapOffset1 = vec(10, 10);
	var miniMapOffset2 = vec(806, 10);

	return function(event) {
		if (event.type !== 'show') {
			behaviorSystem.update(event);
		}

		switch (event.type) {
			case 'update':
				if (!gameEnded) {
					update(event.dt);
				}

				RelativeSystem.update(entities);

				break;

			case 'show':
				var context = event.context;
				var canvas = context.canvas;

				MapView.render(context, map, rcoords(0, 0, canvas.width * 0.5, canvas.height), [player2, player]);
				MapView.render(context, map, rcoords(canvas.width * 0.5, 0, canvas.width * 0.5, canvas.height), [player, player2]);

				MiniMapView.render(context, map, [player2, player], miniMapOffset1);
				MiniMapView.render(context, map, [player, player2], miniMapOffset2);

				renderSystem.show(context, entities);
				break;

			case 'keydown':
				if (gameEnded) {
					init();
				} else {
					keyDown(event.keyCode);
				}
				break;
		}
	};
}