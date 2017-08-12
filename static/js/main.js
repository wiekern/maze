
var mazeGame;
var time, timer, startTime;
var mazeOptions = {
	onGameEnd: function(didWin){
		clearInterval(timer);
		gameInProgress = false;
		center($("#options").show());
	},
	onStart: function(){
		startTime = new Date();
		timer = setInterval(timeTick, 100);
		showTime();
		showSteps();
	}
};

$(document).ready(function () {
	var workspace = Blockly.inject('blocklyDiv',
  	{toolbox: document.getElementById('toolbox')});
  	Blockly.Xml.domToWorkspace(workspace, blocklyDiv);
  	// For test.
	var workspaceBlocks = document.getElementById("workspaceBlocks"); 
	/* Load blocks to workspace. */
	Blockly.Xml.domToWorkspace(workspace, workspaceBlocks);

  	$("#runCode").click(function () {
  		// console.log(Blockly.Xml.workspaceToDom(workspace));
  		mazeGame.reset();
        var code = Blockly.JavaScript.workspaceToCode(workspace);
        console.log(code);
        try {
            eval(code);
        } catch (e) {
            alert(e);
        }
    });

	mazeGame = new MazeGame(document.getElementById('maze'), mazeOptions);

	$("form").on('submit', function () {
		mazeOptions.level_size = [$('#w').val(), $('#h').val()];
		mazeOptions.levelOption = $('#level-option input:radio:checked').val();
		mazeGame = new MazeGame(document.getElementById('maze'), mazeOptions);
		$('#options, #end-game').hide();
		return false;
	});
	$('body').on('keypress', '#h, #options', function (e) {
		return (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) ? false : true;
	})
	$(window).on('click', function(e){
		if (!$(e.target).is("#options") && $(e.target).parents('#options').length == 0)
			$('#options').hide();
	});
	// $('a[href=#options]').on('click', function(){
	$('a[href*=\\#options]').on('click', function(){
		center($('#options').show());
		return false;
	});

	$('#game-mode span').on('click', function() {
		var game_mode = $(this).text();
		console.log(game_mode);
		if (game_mode === 'Blockly') {
			$(this).text('Regel');
			$('#mode-blockly').show();
			Blockly.Xml.domToWorkspace(workspace, blocklyDiv);
			$('#mode-rule').hide();
			$('#new-rule').hide();
		} else if (game_mode === 'Regel') {
			$(this).text('Blockly');
			$('#mode-blockly').hide();
			$('#mode-rule').show();
			$('#new-rule').show();
		} else {
			$(this).text('Regel');
			$('#mode-blockly').hide();
			$('#mode-rule').show();
			$('#new-rule').show();
		}
	});

	$('#save-solution').on('click', function() {
		crud.saveSolution();
	});

	$('#new-rule').on('click', function() {
		showSituation();
	});

	$('#cross-mark').on('click', function() {
		mazeGame.drawMarks();
	});

	$('#rule-list').delegate('a', 'click', function() {
		mazeGame.removeRule($(this).attr('name'));
		$(this).parent().parent().remove();
	});

	$('#action-list').delegate('a', 'click', function() {
		mazeGame.removeRule($(this).attr('name'));
		$(this).parent().remove();
	});

	$('#go-forward').on('click', function(){
		addAction("V");
	});
	$('#turn-left').on('click', function(){
		addAction("L");
	});
	$('#turn-right').on('click', function() {
		addAction("R");
	});

	$('#executeAction').on('click', function() {
		let actionsText = $('#actions').val();
		if (!actionsText) {
			return;
		}
		$('#actions').val('');
		// 1. store rule
		mazeGame.setSituation(true);
		mazeGame.storeActions(actionsText);
		// 2. show rule
		let situation = mazeGame.getLongSituation();
		$('#rule-list').append('<tr><td>' + situation.up + '</td>' + '<td>'+ situation.left + '</td>'
			 + '<td>' + situation.right + '</td>' 
			 + '<td>' + mazeGame.getActionsOfSituation() + '</td>' 
			 + '<td><a class="badge" name="' + mazeGame.getShortSituation() + '">' + '&times;</a></td></tr>');


		$('#situation-modal').modal('hide');

		// executeActionsWithTimeout(actionsText);
		do {
			if (executeActions(actionsText) === false) {
				break;
			}
			// update the rule (actions)
			actionsText = mazeGame.getActionsOfSituation();
			// console.log('actionsText:' + actionsText);
		} while (mazeGame.isSituationExisted());

		if (!mazeGame.foundExit()) {
			$('#situation-modal').one('hidden.bs.modal', function (e) {
				showSituation();
			});
		} else {
			$('#situation-modal').modal('hide');
			center($("#options").show());
		}
	});

	// showSituation();
	showRule();

	//Pledge Algo
	$('#pledge-algo').on('click', function() {
		// pledgeAlgo();
		mazeGame.reset();
		pledgeAlgoWithTimeout(300);
	});
	var controller = new Controller(mazeGame);

	$('#tremaux-algo').on('click', function() {
		mazeGame.reset();
		controller.run();
	});
});
$(window).on('keydown', function (e) {
	var keyCode = e.keyCode || e.which,
		keyCodes = {
			37: "left",
			38: "up",
			39: "right",
			40: "down",
			65: "left",
			87: "up",
			68: "right",
			83: "down"
		};
	if (keyCodes[keyCode] !== null && keyCodes[keyCode] !== undefined) {
		// send arrow keys and wsad to game
		mazeGame.move(keyCodes[keyCode]);
		if (mazeGame.foundExit()) {
			$('#situation-modal').modal('show');
		} else {
			showSituation();
		}
		return false;
	} else if (keyCode === 27) {
		// close options on escape
		$('#options').hide();
		return false;
	}
});

function showRule() {
	$('#game-mode span').text('Blockly');
	$('#mode-blockly').hide();
	$('#mode-rule').show();
	// $('#mode-blockly').css('visibility', 'hidden');
	// $('#mode-rule').css('visibility', 'visible');
}

function addAction(action) {
	let actionsText = $('#actions').val() + action;
	$('#actions').val(actionsText);
}

function executeActions(actions) {
	for (var i = 0; i < actions.length; i++) {
		if (actions[i] === 'L') {
			moveDir("left");
		} else if (actions[i] === 'R') {
			moveDir("right");
		} else if (actions[i] === 'V') {
			if (moveDir("up") === false) {
				return false;
			}
		}

		if (mazeGame.foundExit()) {
			return false;
		}
		if (mazeGame.turnCircle()) {
			mazeGame.resetAngle();
			return false;
		} 
		// if (mazeGame.curPosInCrossPos()) {
		// 	return false;
		// }
	}
}

function executeActionsWithTimeout(actionsText) {

	if (executeActions(actionsText) === false) {
		return;
	}
	// update the rule (actions)
	actionsText = mazeGame.getActionsOfSituation();

	if (mazeGame.isSituationExisted()) {
		window.setTimeout(function() {
			executeActions(actionsText);
		}, 100);
	}

	if (!mazeGame.foundExit()) {
		$('#situation-modal').one('hidden.bs.modal', function (e) {
			showSituation();
		});
	} else {
		$('#situation-modal').modal('hide');
		center($("#options").show());
	}
}

function moveDir(dir) {
	let forwardDir = mazeGame.getForwardDir(dir);
	
	// show all steps if game mode is Regel.
	console.log($('#game-mode span').text());
	if ($('#game-mode span').text() === 'Blockly') {
		showCurrentStatus(forwardDir);
	}
	if (mazeGame.move(forwardDir) === false) {
		return false;
	}

	// if (mazeGame.turnCircle()) {
	// 	mazeGame.resetAngle();
	// 	return false;
	// }
	return true;
}

function showCurrentStatus(forwardDir) {
	let status = mazeGame.getCurrentStatus();

	$('#action-list').append('<tr><td>' + status.faceTo + '</td>' + '<td>'+ status.x + '</td>'
	 + '<td>' + status.y + '</td>' 
	 + '<td>' + forwardDir + '</td>');
}

function showSituation() {
	if (mazeGame != undefined) {

		let situation = mazeGame.getSituation();

		if (situation["up"] === false) {
			$('#myup').removeClass().addClass("btn btn-success btn-transparent disabled");
			$('#myup').text("Vorne Frei");
		} else {
			$('#myup').removeClass().addClass("btn btn-default disabled btn-transparent");
			$('#myup').text("Vorne Belegt");
		}
		if (situation["left"] === false) {
			$('#myleft').removeClass().addClass("btn btn-success btn-transparent disabled");
			$('#myleft').text("Links Frei");
		} else {
			$('#myleft').removeClass().addClass("btn btn-default disabled btn-transparent");
			$('#myleft').text("Links Belegt");
		}
		if (situation["right"] === false) {
			$('#myright').removeClass().addClass("btn btn-success btn-transparent disabled");
			$('#myright').text("Rechts Frei");
		} else {
			$('#myright').removeClass().addClass("btn btn-default disabled btn-transparent");
			$('#myright').text("Rechts Belegt");
		}

		$('#rotatedAngle').text(mazeGame.getAngle() + " Grad");

		$('#situation-modal').modal('show');
	}
}

function center(e) {
	e.css('top', $("#maze").offset().top + $("#maze").height() / 2 - e.outerHeight() / 2);
}

function showTime() {
	deltaTime = Math.floor(((new Date).getTime() - startTime.getTime()) / 1000);
	$("#time").html(deltaTime + " second" + (deltaTime !== 1 ? "s" : ""));
}

function showSteps() {
	var steps = 0
	if (mazeGame != undefined)
		steps = mazeGame.getSteps()
	$("#steps").html(steps + " step" + (steps !== 1 ? "s" : ""));
}

function timeTick() {
	showTime();
}
