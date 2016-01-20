var RootScreen = function() {
	var levels = [
		{
			players: 1,
			ai: 0,
			map: [
				"     ",
				"     ",
				"X---Y",
				"     ",
				"     "
			]
		},
		{
			players: 1,
			ai: 0,
			map: [
				"  Y",
				"  |",
				"X-0"
			]
		},
		{
			players: 1,
			ai: 0,
			map: [
				"  0--0  ",
				"X-0--0-Y"
			]
		},
		{
			players: 1,
			ai: 0,
			map: [
				"  0-------------0",
				"  |             |",
				"X-0             Y",
				"  | 0-0         |",
				"  0-0 0---------0",
			]
		},
		{
			players: 1,
			ai: 0,
			map: [
				"0------0------Y",
				"|      |      |",
				"0------0------0",
				"|      |      |",
				"X------0------0",
			]
		},
		{
			players: 1,
			ai: 0,
			map: [
				"     0--------0",
				"0---0|  0-----0",
				"| X-0|Y-0      ",
				"|   00  0-0    ",
				"0---------0    ",
			]
		},
		{
			players: 1,
			ai: 1,
			map: [
				"          0---0              ",
				"          |   |   0---0      ",
				"     0----0-0 0---0   |      ",
				"     |      |         |      ",
				"X-0-000-0---0---0---0-0--0--Y",
				"  | 0-0 |       0---0 |  |   ",
				"  |     |  0----0     0--0   ",
				"  0--0  |  |                 ",
				"     0--0--0                 ",
			]
		},
		{
			players: 1,
			ai: 1,
			map: [
				"        0-----0              ",
				"        |  0--0              ",
				"0---0---0  0--------0        ",
				"|   |               |        ",
				"X---0-------0       0-------Y",
				"    |       |       |        ",
				"    |0-0    0----0  |        ",
				"    00 00   0-0  |  |        ",
				"        0-----0  0--0        ",
			]
		}
	];

	return Screen.run(function*() {
		yield LoadingScreen();
		
		while (true) {
			// yield TitleScreen();

			for (var i = 5; i < levels.length; i++) {
				var level = levels[i];
				yield MainScreen(level.map, level.players, level.ai);
			}
		}
	});
}