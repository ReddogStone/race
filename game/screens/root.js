var RootScreen = function() {
	function getLevels() {
		return [
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
			}
		];
	}

	return Screen.run(function*() {
		yield LoadingScreen();

		var languageId = yield LanguageSelectionScreen();
		getString = Localization(STRINGS, languageId);

		var levels = getLevels();
		
		while (true) {
			yield TitleScreen();

			for (var i = 0; i < levels.length; i++) {
				var level = levels[i];
				yield MainScreen(level);
			}

			yield ToBeContinuedScreen();
		}
	});
}