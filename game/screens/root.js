var RootScreen = function() {
	var map = [
		"          0---0              ",
		"          |   |   0---0      ",
		"     0----0-0 0---0   |      ",
		"     |      |         |      ",
		"X-0-000-0---0---0---0-0--0--Y",
		"  | 0-0 |       0---0 |  |   ",
		"  |     |  0----0     0--0   ",
		"  0--0  |  |                 ",
		"     0--0--0                 ",
	];

	var map = [
		"        0-----0              ",
		"        |  0--0              ",
		"    0---0  0--------0        ",
		" 00 |               |        ",
		"X00-0-------0       0-------Y",
		"    |       |       |        ",
		"    |0-0    0----0  0        ",
		"    00 00   0-0  |  |        ",
		"        0-----0  0--0        ",
	];

	var start = Time.now();
	var path = PathFinding.shortest(map, MapLogic.getStart(map), vec(0, 0), 0);
	console.log('Pathfinding: ' + (Time.now() - start));

	return Screen.run(function*() {
		yield LoadingScreen();
		
		while (true) {
			yield TitleScreen();

			while (true) {
				yield MainScreen(map, 1);
			}
		}
	});
}