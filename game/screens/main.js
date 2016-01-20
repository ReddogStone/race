var MainScreen = function(map, playerCount, aiCount, startMessage) {
	var entities = EntitySystem();
	var behaviorSystem = BehaviorSystem();
	
	var playerLogic = PlayerLogic(behaviorSystem);
	var aiSystem = AiSystem(playerLogic);
	var playerCollision = PlayerCollision(playerLogic);
	var miniMapView = MiniMapView(map);
	var mapView = MapView(map);

	var timeText = entities.add({
		pos: vec(20, 640),
		size: vec(600, 100),
		text: {
			font: { name: 'consolas', height: 50, lineSpacing: 1.5 },
			message: "Choose direction"
		},
		render: { scriptId: 'text' },
		style: { fill: 'red' },
		zOrder: 4,
	});

	var startPos = MapLogic.getStart(map);

	var Dirs = {
		LEFT: vec(-1, 0),
		UP: vec(0, -1),
		RIGHT: vec(1, 0),
		DOWN: vec(0, 1)
	};

	var KEY_MAP = {
		// left, up, right, down
		37: { index: 1, dir: 'LEFT' },
		38: { index: 1, dir: 'UP' },
		39: { index: 1, dir: 'RIGHT' },
		40: { index: 1, dir: 'DOWN' },

		// a, w, d, s
		65: { index: 0, dir: 'LEFT' },
		87: { index: 0, dir: 'UP' },
		68: { index: 0, dir: 'RIGHT' },
		83: { index: 0, dir: 'DOWN' }
	};

	function makePlayer(name, style, index) {
		var result = {
			name: name,
			rotation: 0,
			anchor: vec(0.9, 0.5),
			style: style
		};
		playerLogic.init(result, startPos);

		result.inputDisplay = InputDisplay(KEY_MAP, index);

		return result;
	}

	var roundStart = 0;

	var players = [
		makePlayer(getString('player1_name'), PLAYER_STYLE, 0),
		makePlayer(getString('player2_name'), PLAYER2_STYLE, 1)
	];

	if (aiCount) {
		var aiPlayer = players[playerCount];
	}

	players = players.slice(0, playerCount + aiCount);

	var sceneDescriptions = [
		{
			offset: vec(0.25, 0.5),
			viewport: rcoords(0, 0, 0.5, 1),
			miniMapOffset: vec(0.25, 0.014)
		},
		{
			offset: vec(0.75, 0.5),
			viewport: rcoords(0.5, 0, 0.5, 1),
			miniMapOffset: vec(0.75, 0.014)
		}
	];

	if (playerCount < 2) {
		sceneDescriptions[0].viewport.sx = 1;
		sceneDescriptions[0].offset.x = 0.5;
		sceneDescriptions[0].miniMapOffset.x = 0.5;

		players[0].name = getString('you_player_name');

		if (aiCount > 0) {
			players[1].name = getString('opponent_player_name');
		}
	}

	var raceUi = RaceUi(sceneDescriptions);

	function update(dt) {
		for (var i = 0; i < players.length; i++) {
			var player = players[i];
			var finished = playerLogic.update(map, player, dt);
			if (finished) {
				return player;
			}			
		}

		if (aiPlayer) {
			aiSystem.update(map, aiPlayer, roundStart);
		}

		playerCollision.update(players);

		if (roundStart > 0) {
			timeText.text.message = (Time.now() - roundStart).toFixed(2);
		}
	}

	function handleKeyDown(key) {
		var action = KEY_MAP[key];
		if (action) {
			return playerLogic.handleInput(map, players[action.index], Dirs[action.dir]);
		}
	}

	function highlightStartDirs() {
		for (var dir in Dirs) {
			if (MapLogic.canGo(map, startPos, Dirs[dir])) {
				players.forEach(function(player) {
					player.inputDisplay.highlight(dir);
				});
			}
		}
	}

	function clearHighlights() {
		players.forEach(function(player) {
			player.inputDisplay.clearHighlights();
		});
	}

	function scaleInputDisplays(value) {
		players.forEach(function(player) {
			player.inputDisplay.scale = value;
		});
	}

	var round = Behavior.run(function*() {
		if (startMessage) {
			yield raceUi.showStartMessage(startMessage.title, startMessage.message);
		}

		highlightStartDirs();
		yield Behavior.filter(function(event) {
			return (event.type === 'keydown') && handleKeyDown(event.keyCode);
		});
		roundStart = Time.now();

		clearHighlights();
		behaviorSystem.add(Behavior.interval(0.5, function(progress) {
			scaleInputDisplays(lerp(1, 0.6, progress));
		}));

		var winningPlayer = yield Behavior.first(
			Behavior.update(update),
			Behavior.forever(function(event) { handleKeyDown(event.keyCode); })
		)

		behaviorSystem.add(raceUi.onWin(winningPlayer, Time.now() - roundStart));

		yield Behavior.first(Behavior.type('keydown'), Behavior.type('mousedown'));
		return {};
	})

	var mainBehavior = Behavior.first(
		Behavior.forever(behaviorSystem.update),
		round
	);

	function renderPlayerScene(context, map, players, mainPlayerIndex, description) {
		var canvas = context.canvas;

		var size = vec(canvas.width, canvas.height);
		var vp = rscale(description.viewport, size);
		var off = vmul(description.offset, size);
		var moff = vmul(description.miniMapOffset, size);

		var prioritizedPlayers = players.slice();
		prioritizedPlayers.push(prioritizedPlayers.splice(mainPlayerIndex, 1)[0]);

		FrameProfiler.start('MapView');
		mapView.render(context, vp, prioritizedPlayers, off);
		FrameProfiler.stop();

		var player = players[mainPlayerIndex];
		var inputDisplaySize = player.inputDisplay.size();
		renderPivotTransformed(context, off.x, canvas.height - 50, 0, 1, inputDisplaySize.x * 0.5, inputDisplaySize.y, function(context) {
			player.inputDisplay.render(context);
		});

		FrameProfiler.start('MiniMapView');
		miniMapView.render(context, prioritizedPlayers, moff);
		FrameProfiler.stop();
	}

	return function(event) {
		if (event.type !== 'show') {
			var result = mainBehavior(event);
			if (result.done) {
				return result.value;
			}
		} else {
			var context = event.context;

			for (var i = 0; i < playerCount; i++) {
				renderPlayerScene(context, map, players, i, sceneDescriptions[i]);
			}

			raceUi.render(context);
		}
	};
}