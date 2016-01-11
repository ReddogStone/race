var MainScreen = function() {
	var entities = EntitySystem();
	var behaviorSystem = BehaviorSystem();
	var renderSystem = RenderSystem({
		'sprite': renderSprite,
		'text': renderText,
		'rect': renderRect,
		'circle': renderCircle
	});

	var playerLogic = PlayerLogic.init(behaviorSystem);

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

	var startPos = MapLogic.getStart(map);

	var player = {
		name: 'GREEN',

		pos: vec(320, 360),
		rotation: 0,

		rect: { width: 80, height: 40, anchor: vec(0.9, 0.5) },
		style: PLAYER_STYLE,

		mapPos: vec(0, 4),
		speed: 0,
		dir: vec(0, 0)
	};

	var player2 = {
		name: 'RED',

		pos: vec(960, 360),
		rotation: 0,

		rect: { width: 80, height: 40, anchor: vec(0.9, 0.5) },
		style: PLAYER2_STYLE,

		mapPos: vec(0, 4),
		speed: 0,
		dir: vec(0, 0)
	};

	var gameEnded = false;
	var roundStart = 0;

	function init() {
		playerLogic.init(player, startPos);
		playerLogic.init(player2, startPos);

		youWinText.text.message = '';
		youWinText.alpha = 0;

		timeText.text.message = 'RIGHT-ARROW to start'

		gameEnded = false;
		roundStart = 0;

		winRect.alpha = 0;
	}

	init();

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

	function keyDown(key) {
		var action = KEY_MAP[key];
		if (action) {
			var handled = playerLogic.handleInput(map, action.player, action.dir);
			if ((roundStart === 0) && handled) {
				roundStart = Time.now();
			}
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