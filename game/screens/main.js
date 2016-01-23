var MainScreen = function(level) {
	var startMessage = level.message;

	var behaviorSystem = BehaviorSystem();

	var raceUi = RaceUi();
	var raceScreen = RaceScreen(behaviorSystem, level);
	
	var round = Behavior.run(function*() {
		if (startMessage) {
			yield raceUi.showStartMessage(startMessage.title, startMessage.message);
		}

		var result = { win: false };
		while (!result.win) {
			raceScreen = RaceScreen(behaviorSystem, level);
			var result = yield raceScreen;

			var finish = result.win ? raceUi.onWin(result.player, result.time) : raceUi.onLose();
			yield finish;
		}

		return {};
	})

	var mainBehavior = Behavior.first(
		Behavior.forever(behaviorSystem.update),
		round
	);

	return function(event) {
		if (event.type !== 'show') {
			var result = mainBehavior(event);
			if (result.done) {
				return result.value;
			}
		} else {
			raceScreen(event);
			raceUi.render(event.context);
		}
	};
}