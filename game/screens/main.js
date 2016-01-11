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
			message: "Chose direction"
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

	var miniMapOffset1 = vec(0.008, 0.014);
	var miniMapOffset2 = vec(0.508, 0.014);

	var gameEnded = false;
	var roundStart = 0;

	var player = makePlayer('GREEN', PLAYER_STYLE);
	var player2 = makePlayer('RED', PLAYER2_STYLE);

	var offset1 = vec(0.25, 0.5);
	var offset2 = vec(0.75, 0.5);

	var viewport1 = rcoords(0, 0, 0.5, 1);
	var viewport2 = rcoords(0.5, 0, 0.5, 1);

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

				var size = vec(canvas.width, canvas.height);
				var vp1 = rscale(viewport1, size);
				var vp2 = rscale(viewport2, size);

				var off1 = vmul(offset1, size);
				var off2 = vmul(offset2, size);

				var moff1 = vmul(miniMapOffset1, size);
				var moff2 = vmul(miniMapOffset2, size);

				MapView.render(context, map, vp1, [player2, player], off1);
				MiniMapView.render(context, map, [player2, player], moff1);

				MapView.render(context, map, vp2, [player, player2], off2);
				MiniMapView.render(context, map, [player, player2], moff2);

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