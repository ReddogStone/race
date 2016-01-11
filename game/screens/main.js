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
			message: "Chose direction to start"
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
		var finished1 = playerLogic.update(map, player, dt);
		var finished2 = playerLogic.update(map, player2, dt);

		if (finished1) {
			win(player);
		}
		if (finished2) {
			win(player2);
		}

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

	function makePlayer(name, style, offset) {
		var result = {
			name: name,
			pos: vclone(offset),
			rotation: 0,
			anchor: vec(0.9, 0.5),
			style: style
		};
		playerLogic.init(result, startPos);
		return result;
	}

	var miniMapOffset1 = vec(10, 10);
	var miniMapOffset2 = vec(806, 10);

	var gameEnded = false;
	var roundStart = 0;

	var player = makePlayer('GREEN', PLAYER_STYLE, vec(320, 360));
	var player2 = makePlayer('RED', PLAYER2_STYLE, vec(960, 360));

	var KEY_MAP = {
		37: { player: player2, dir: vec(-1, 0) },
		38: { player: player2, dir: vec(0, -1) },
		39: { player: player2, dir: vec(1, 0) },
		40: { player: player2, dir: vec(0, 1) },

		65: { player: player, dir: vec(-1, 0) },
		87: { player: player, dir: vec(0, -1) },
		68: { player: player, dir: vec(1, 0) },
		83: { player: player, dir: vec(0, 1) }
	};

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
					return {};
				}

				keyDown(event.keyCode);
				break;
		}
	};
}