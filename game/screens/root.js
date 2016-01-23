var RootScreen = function() {
	function getLevels() {
		return [
			{
				players: 1,
				ai: 0,
				map: [
					"       ",
					"       ",
					" X---Y ",
					"       ",
					"       "
				],
				message: {
					title: getString('level1_title'),
					message: getString('level1_msg')
				}
			},
			{
				players: 1,
				ai: 0,
				map: [
					"     ",
					"   Y ",
					"   | ",
					" X-0 ",
					"     "
				],
				message: {
					title: getString('level2_title'),
					message: getString('level2_msg')
				}
			},
			{
				players: 1,
				ai: 0,
				map: [
					"          ",
					"   0--0   ",
					" X-0--0-Y ",
					"          "
				],
				message: {
					title: getString('level3_title'),
					message: getString('level3_msg')
				}
			},
			{
				players: 1,
				ai: 0,
				map: [
					"                   ",
					"   0-------------0 ",
					"   |             | ",
					" X-0             Y ",
					"   | 0-0         | ",
					"   0-0 0---------0 ",
					"                   "
				],
				message: {
					title: getString('level4_title'),
					message: getString('level4_msg')
				}
			},
			{
				players: 1,
				ai: 0,
				map: [
					"                 ",
					" 0------0------Y ",
					" |      |      | ",
					" 0------0------0 ",
					" |      |      | ",
					" X------0------0 ",
					"                 "
				],
				message: {
					title: getString('level5_title'),
					message: getString('level5_msg')
				}
			},
			{
				players: 1,
				ai: 0,
				map: [
					"                   ",
					"      0----------0 ",
					" 0---0|  0-------0 ",
					" | X-0|Y-0         ",
					" |   00  0-0       ",
					" 0---------0       ",
					"                   ",
				],
				message: {
					title: getString('level6_title'),
					message: getString('level6_msg')
				}
			},
			{
				players: 1,
				ai: 0,
				map: [
					" Y---------------0 ",
					"    0------------0 ",
					"    | 0----------0 ",
					" X--0 0----------0 ",
					"    | 0----------0 ",
					"    0------------0 ",
				],
				message: {
					title: getString('level7_title'),
					message: getString('level7_msg')
				},
				visibleSize: 4
			},
			{
				players: 1,
				ai: 0,
				map: [
					" 0-0------0|0-----0 ",
					" | | 0----0|0-----0 ",
					" | | | 0---Y      | ",
					" | | | | X--------0 ",
					" | | | | |          ",
					" | 0-0-0 0--------0 ",
					" 0----------------0 ",
				],
				message: {
					title: getString('level8_title'),
					message: getString('level8_msg')
				},
				visibleSize: 4
			},
			{
				players: 1,
				ai: 0,
				map: [
					"       0--0-----0     ",
					"       |  0-----0     ",
					"       |  |     |     ",
					" Y---X-0--0-----00--0 ",
					"       |  |      |    ",
					"       |  0------0    ",
					"       0---------0    ",
				],
				message: {
					title: getString('level9_title'),
					message: getString('level9_msg')
				},
				visibleSize: 5,
				timeLimit: 5
			},
			{
				players: 1,
				ai: 1,
				map: [
					"           0---0               ",
					"           |   |   0---0       ",
					"      0----0-0 0---0   |       ",
					"      |      |         |       ",
					" X-0--0--0---0---0---0-0--0--Y ",
					"   |     |       0---0 |  |    ",
					"   |     |  0----0     0--0    ",
					"   0--0  |  |                  ",
					"      0--0--0                  ",
				],
				message: {
					title: getString('level10_title'),
					message: getString('level10_msg')
				},
			},
			{
				players: 1,
				ai: 1,
				map: [
					"         0-----0               ",
					"         |  0--0               ",
					" 0---0---0  0--------0         ",
					" |   |               |         ",
					" X---0-------0       0-------Y ",
					"     |       |       |         ",
					"     |0-0    0----0  |         ",
					"     00 00   0-0  |  |         ",
					"         0-----0  0--0         ",
				]
			}
		];
	}

	return Screen.run(function*() {
		yield LoadingScreen();
		
		while (true) {
			// var languageId = yield LanguageSelectionScreen();
			// getString = Localization(STRINGS, languageId);

			var levels = getLevels();

			// yield TitleScreen();

			for (var i = 8; i < levels.length; i++) {
				var level = levels[i];
				yield MainScreen(level);
			}
		}
	});
}