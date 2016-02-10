var RootScreen = function() {
	var VALUE_MAP = {
		1: ' ',
		2: '0',
		3: 'X',
		4: 'Y'
	};

	function importMap(mapName, message) {
		var map = TileMaps[mapName];
		var tileLayer = map.layers[0];
		var objectLayer = map.layers[1];

		var tiles = [];
		var index = 0;
		for (var y = 0; y < tileLayer.height; y++) {
			var row = [];
			for (var x = 0; x < tileLayer.width; x++) {
				var value = 
				row[x] = VALUE_MAP[tileLayer.data[index]];
				index++;
			}
			tiles[y] = row;
		}

		var dots = objectLayer.objects.map(function(object) {
			return {
				pos: vclone(object)
			};
		});

		return {
			map: tiles,
			dots: dots,
			message: message
		};
	}

	function getLevels() {
		return [
			importMap('map1'),
			importMap('map2'),
			importMap('map3'),
			{
				players: 1,
				ai: 0,
				map: [
					"00 000 Y",
					"X0 0 0 0",
					"0000 000",
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
					"00000Y",
					"X00000",
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
					"0000      ",
					"X00000000Y",
					"0000    00",
					"  00000000",
					"  00000000",
					"          ",
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
					"00000000000",
					"00000000000",
					"00 00 00 00",
					"00000000000",
					"X000000000Y",
					"00000000000",
					"00 00 00 00",
					"00000000000",
					"00000000000"
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
					"00000000000",
					"00000000000",
					"00000000000",
					"00000000000",
					"0000X0 000Y",
					"00000000000",
					"00000000000",
					"00000000000",
					"00000000000"
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
					"         0000000000",
					"00000 00 0 00 00000",
					"X0000 00 0000000 00",
					"00000 0000000000 0Y",
					"   00 00 0000000 00",
					"   00 00 0 00 00000",
					"   00000 0000000000"
				],
				message: {
					title: getString('level5_title'),
					message: getString('level5_msg')
				}
			}
		];
	}

	return Screen.run(function*() {
		yield LoadingScreen();

		// var languageId = yield LanguageSelectionScreen();
		// getString = Localization(STRINGS, languageId);

		var levels = getLevels();
		
		while (true) {
			// yield TitleScreen();

			for (var i = 2; i < levels.length; i++) {
				var level = levels[i];
				yield MainScreen(level);
			}

			yield ToBeContinuedScreen();
		}
	});
}