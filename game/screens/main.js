var MainScreen = function(map, playerCount) {
	var entities = EntitySystem();
	var behaviorSystem = BehaviorSystem();
	var renderSystem = RenderSystem({
		'sprite': renderSprite,
		'text': renderText,
		'rect': renderRect,
		'circle': renderCircle
	});

	var playerLogic = PlayerLogic(behaviorSystem);

	var winRect = entities.add({
		pos: vec(640, 150),
		render: { scriptId: 'rect' },
		rect: { width: 1000, height: 400, anchor: vec(0.5, 0) },
		style: WIN_BG_STYLE,
		zOrder: 3,
		alpha: 0
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
			message: "Choose direction"
		},
		render: { scriptId: 'text' },
		style: { fill: 'red' },
		zOrder: 4,
	});

	var startPos = MapLogic.getStart(map);

	function win(entity) {
		var time = Time.now() - roundStart;

		youWinText.style.fill = entity.style.stroke;
		youWinText.text.message = "{{bold}}{{center}}" + entity.name + " FINISHED\n" + time.toFixed(2) + 's';

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
	}

	function update(dt) {
		players.forEach(function(player) {
			var finished = playerLogic.update(map, player, dt);
			if (finished) {
				win(player);
			}
		});

		if (roundStart > 0) {
			timeText.text.message = (Time.now() - roundStart).toFixed(2);
		}
	}

	function keyDown(key) {
		var action = KEY_MAP[key];
		if (action) {
			var handled = playerLogic.handleInput(map, action.player, action.dir);
			if ((roundStart === 0) && handled) {
				roundStart = Time.now();
			}
		}
	}

	function makePlayer(name, style) {
		var result = {
			name: name,
			rotation: 0,
			anchor: vec(0.9, 0.5),
			style: style
		};
		playerLogic.init(result, startPos);
		return result;
	}

	var gameEnded = false;
	var roundStart = 0;

	var players = [
		makePlayer('GREEN', PLAYER_STYLE),
		makePlayer('RED', PLAYER2_STYLE)
	];

	players = players.slice(0, playerCount);

	var sceneDescriptions = [
		{
			offset: vec(0.25, 0.5),
			viewport: rcoords(0, 0, 0.5, 1),
			miniMapOffset: vec(0.008, 0.014)
		},
		{
			offset: vec(0.75, 0.5),
			viewport: rcoords(0.5, 0, 0.5, 1),
			miniMapOffset: vec(0.508, 0.014)
		}
	];

	if (playerCount < 2) {
		sceneDescriptions[0].viewport.sx = 1;
		sceneDescriptions[0].offset.x = 0.5;
		sceneDescriptions[0].miniMapOffset.x += 0.5;
	}

	var KEY_MAP = {
		// left, up, right, down
		37: { player: players[1], dir: vec(-1, 0) },
		38: { player: players[1], dir: vec(0, -1) },
		39: { player: players[1], dir: vec(1, 0) },
		40: { player: players[1], dir: vec(0, 1) },

		// a, w, d, s
		65: { player: players[0], dir: vec(-1, 0) },
		87: { player: players[0], dir: vec(0, -1) },
		68: { player: players[0], dir: vec(1, 0) },
		83: { player: players[0], dir: vec(0, 1) }
	};

	function renderPlayerScene(context, map, players, mainPlayerIndex, description) {
		var canvas = context.canvas;

		var size = vec(canvas.width, canvas.height);
		var vp = rscale(description.viewport, size);
		var off = vmul(description.offset, size);
		var moff = vmul(description.miniMapOffset, size);

		var prioritizedPlayers = players.slice();
		prioritizedPlayers.push(prioritizedPlayers.splice(mainPlayerIndex, 1)[0]);

		MapView.render(context, map, vp, prioritizedPlayers, off);
		MiniMapView.render(context, map, prioritizedPlayers, moff);
	}

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

				for (var i = 0; i < playerCount; i++) {
					renderPlayerScene(context, map, players, i, sceneDescriptions[i]);
				}

				renderSystem.show(context, entities);
				break;

			case 'keydown':
				if (gameEnded) {
					return {};
				}

				keyDown(event.keyCode);
				break;
		}
	};
}