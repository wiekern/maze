var gUsername;
var mazeGame, workspace, moveList = [], modalIsHided = false;
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
	workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')});
  	Blockly.Xml.domToWorkspace(workspace, blocklyDiv);
  	// For test.
	var workspaceBlocks = document.getElementById("workspaceBlocks"); 
	/* Load blocks to workspace. */
	Blockly.Xml.domToWorkspace(workspace, workspaceBlocks);

  	$("#run-code").click(function () {
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

	$("#options form").on('submit', function () {
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
		var solutionName = $('#save-solution').parent().prev().val();
		if (!solutionName) {
			 alert('Bitte geben den Name ein');
			 return ;
		}
		// rule
		if ($('#game-mode span').text() === 'Blockly') {
			gUsername = $('#username').text();
			if (!gUsername) {
				alert('Nutzer ist Leer.');
				return ;
			}
			$.post('/api/solutions', {solution: mazeGame.solutionToJson(solutionName), username: gUsername}, 
				function(data, status) {
					if (!data.ok) {
						alert(data.msg);
					}

			});
		} else if ($('#game-mode span').text() === 'Regel') {	//Blockly
			var code = Blockly.Xml.workspaceToDom(workspace);
			var code_text = Blockly.Xml.domToText(code);
			var solution = JSON.stringify({name: solutionName, code: code_text});
			gUsername = $('#username').text();
			if (!gUsername) {
				alert('Nutzer ist Leer.');
				return ;
			}
			$.post('/api/blocklys', {solution: solution, username: gUsername}, 
				function(data, status) {
					if (!data.ok) {
						alert(data.msg);
					}
			});
		}
	});

	$('#load-solution').on('click', function() {
		if ($('#game-mode span').text() === 'Blockly') {	//rule
			gUsername = $('#username').text();
			if (!gUsername) {
				alert('Nutzer ist Leer.');
				return ;
			}
			$('#load-solution').next().text('');
			$.get('/api/solutions', {username: gUsername}, 
			function(data) {
				if (!data.ok) {
					alert(data.msg);
					return ;
				} else {
					var res = data.res
					for (var i = 0; i < res.length; i++) {
						$('#load-solution').next().append('<li><a>' + res[i].name + '</a></li>');
					}
				}
			});
			$('#run-solution').removeClass().addClass('btn btn-success');
		} else if ($('#game-mode span').text() === 'Regel') {	//blockly
			gUsername = $('#username').text();
			if (!gUsername) {
				alert('Nutzer ist Leer.');
				return ;
			}
			$('#load-solution').next().text('');
			$.get('/api/blocklys', {username: gUsername}, 
			function(data) {
				gUsername = $('#username').text();
				if (!gUsername) {
					alert('Nutzer ist Leer.');
					return ;
				}

				if (data.ok) {
					var solutions = data.res;

					for (var i = 0; i < solutions.length; i++) {
						$('#load-solution').next().append('<li><a>' + solutions[i].name + '</a></li>');
					}
				} else {
					alert(data,msg);
				}
			});
			$('#run-solution').removeClass().addClass('btn btn-success');
		}
	});

	$('#solutions-list').on('click', 'a', function() {
		var name = $(this).text();
		gUsername = $('#username').text();
		if (!gUsername) {
			alert('Nutzer ist Leer.');
			return ;
		}
		if ($('#game-mode span').text() === 'Blockly') {	//rule
			$.get('/api/solutions/'+$(this).text(), {username: gUsername}, 
			function(data) {
				if (data.ok) {
					var solutionObj = mazeGame.updateSolutionObj(data.res);
					// console.log(solutionObj);
					loadSolutionOfRule(solutionObj);			
				} else {
					alert(data.msg)
				}

			});
		} else if ($('#game-mode span').text() === 'Regel') {	//blockly
			$.get('/api/blocklys/'+$(this).text(), {username: gUsername},
			function(data) {
				if (data.ok){
					loadSolutionOfBlockly(data.res);
				} else {
					alert(data.msg);
				}
			});
		}
	});

	$('#run-solution').on('click', function() {
		mazeGame.reset();
		if ($('#game-mode span').text() === 'Blockly') {
			$('#action-list').text('');

			let actionsText = mazeGame.getActionsOfSituation();
			mazeGame.saveCurPos();
			do {
				if (simulateActions(actionsText) === false) {
					break;
				}
				// update the rule (actions)
				actionsText = mazeGame.getActionsOfSituation();
			} while (mazeGame.isSituationExisted());

			executeActions(moveList);

		} else if ($('#game-mode span').text() === 'Regel') {
	        var code = Blockly.JavaScript.workspaceToCode(workspace);
	        console.log(code);
	        try {
	            eval(code);
	        } catch (e) {
	            alert(e);
	        }
		}
	});

	$('#new-rule').on('click', function() {
		$('#alert-msg span').text('Stelle neue Regel.')
		showSituation();
	});

	$('#rule-list').delegate('a', 'click', function() {
		mazeGame.removeRule($(this).attr('name'));
		$(this).parent().parent().remove();
	});

	$('#action-list').delegate('a', 'click', function() {
		mazeGame.removeRule($(this).attr('name'));
		$(this).parent().remove();
	});

	$('#place-mark').on('click', function() {
		mazeGame.placeMark();
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

	$('#execute-action').on('click', function() {
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
		$('#rule-list').append('<tr><td>' + situation.up + '</td>' 
			 + '<td>'+ situation.left + '</td>'
			 + '<td>' + situation.right + '</td>' 
			 + '<td>' + mazeGame.getActionsOfSituation() 
			 + '<a class="badge" name="' + mazeGame.getShortSituation() 
			 + '" style="float: right">' + '&times;</a></td></tr>');
		
		$('#situation-modal').modal('hide');

		$('#situation-modal').one('hidden.bs.modal', function (e) {
			modalIsHided = true;
		});

		mazeGame.saveCurPos();
		do {
			if (simulateActions(actionsText) === false) {
				// console.log('action finished, break');
				break;
			}
			// update the rule (actions)
			actionsText = mazeGame.getActionsOfSituation();
			// console.log('actionsText:' + actionsText);
		} while (mazeGame.isSituationExisted());

		executeActions(moveList);
	});

	showRule();

	//Pledge Algo
	$('#pledge-algo').on('click', function() {
		if (gend) {
			mazeGame.reset();
			pledgeAlgoWithTimeout(300);	
		}
	});
	$('#hand-algo').on('click', function() {
		if (gend) {
			mazeGame.reset();
			rightHand(300);	
		}
	});

	var controller = new Controller(mazeGame);

	$('#tremaux-algo').on('click', function() {
		console.log('[end]' + controller.end);
		if (controller.end) {
			mazeGame.reset();
			controller.init();
			controller.run();	
		} else {
			console.log('not end...');
		}

	});
});
$(window).on('keydown', function (e) {
	var keyCode = e.keyCode || e.which,
		keyCodes = {
			37: "left",
			38: "up",
			39: "right",
			40: "down"
			// 65: "left",
			// 87: "up",
			// 68: "right",
			// 83: "down"
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

function loadSolutionOfRule(solution) {
	$('#rule-list').html('');
	if (solution) {
		for (var i = 0; i < solution.situations.length; i++) {
			let situation = solution.situations[i];
			if (situation === true) {
				situation = mazeGame.shortSituationToObj(i);
				$('#rule-list').append(
				'<tr><td>' + (situation.up === true?'Belegt':'Frei') + '</td>' 
				+ '<td>'+ (situation.left === true?'Belegt':'Frei') + '</td>'
		 		+ '<td>' + (situation.right === true?'Belegt':'Frei') + '</td>' 
		 		+ '<td>' + solution.actionsList[i]
		 		+ '<a class="badge" name="' + i 
		 		+ '" style="float: right">' + '&times;</a></td></tr>');
			}
		}
	}
}

function loadSolutionOfBlockly(solution) {
	workspace.clear();
	if (solution) {
		solution = JSON.parse(solution);
		var xml = Blockly.Xml.textToDom(solution.code);
		Blockly.Xml.domToWorkspace(xml, workspace);
	}
}

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

function simulateActions(actions) {
	for (var i = 0; i < actions.length; i++) {
		if (actions[i] === 'L') {
			moveList.push('left');
			if (!simulateMoveDir("left")) {
				return false;
			}
		} else if (actions[i] === 'R') {
			moveList.push('right');
			if (!simulateMoveDir("right")) {
				return false;
			}
		} else if (actions[i] === 'V') {
			moveList.push('up');
			if (!simulateMoveDir("up")) {
				return false;
			}
		}
	}
}

function simulateMoveDir(dir) {

	let forwardDir = mazeGame.getForwardDir(dir);

	if (!mazeGame.simulateMove(forwardDir)) {
		return false;
	}

	return true;
}


function moveDir(dir) {

	let forwardDir = mazeGame.getForwardDir(dir);
	
	// show all steps if game mode is Regel.
	if ($('#game-mode span').text() === 'Blockly') {
		showCurrentStatus(forwardDir);
	}

	if (!mazeGame.move(forwardDir)) {
		return false;
	}

	return true;
}

function executeActions(actions) {
	mazeGame.restoreCurPos();
	let i = 0,len = actions.length;
	var wrapperMoveDir = function() {
		setTimeout(function() {
			moveDir(actions[i++]);
			if (i < len) {
				wrapperMoveDir();
			} else {
				moveList = [];
				if (!mazeGame.foundExit()) {
					console.log(mazeGame.getMsgType());
					if (!modalIsHided) {
						$('#situation-modal').off('hidden.bs.modal').one('hidden.bs.modal', function (e) {
							if (mazeGame.getMsgType().WALL) {
								$('#alert-msg span').text('Treffe eine Wand, bewege nicht weiter.');
							} else if (mazeGame.getMsgType().MARK) {
								$('#alert-msg span').text('Marker liegt vor.');
							} else if (mazeGame.getMsgType().CIRCLE) {
								$('#alert-msg span').text('Drehe sich um 360 Grad.');
							} else {
								$('#alert-msg span').text('Treffe eine neue Situation.');
							}
							showSituation();
						});
					} else {
						modalIsHided = false;
						if (mazeGame.getMsgType().WALL) {
							$('#alert-msg span').text('Treffe eine Wand, bewege nicht weiter.');
						} else if (mazeGame.getMsgType().MARK) {
							$('#alert-msg span').text('Marker liegt vor.');
						} else if (mazeGame.getMsgType().CIRCLE) {
							$('#alert-msg span').text('Drehe sich um 360 Grad.');
						} else {
							$('#alert-msg span').text('Treffe eine neue Situation.');
						}
						showSituation();
					}
				} else {
					$('#situation-modal').modal('hide');
					center($("#options").show());
				}
			}

			
		}, 200);
	};
	wrapperMoveDir();
}

function showCurrentStatus(forwardDir) {
	let status = mazeGame.getCurrentStatus();

	var toGerman = {
		up: 'oben',
		down: 'unten',
		left: 'links',
		right: 'rechts'
	}

	$('#action-list').append('<tr><td>' + toGerman[status.faceTo] + '</td>'
	 + '<td>'+ status.x + '</td>'
	 + '<td>' + status.y + '</td>' 
	 + '<td>' + toGerman[forwardDir] + '</td>');
}

function showSituation() {
	if (mazeGame) {

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
	if (mazeGame)
		steps = mazeGame.getSteps()
	$("#steps").html(steps + " step" + (steps !== 1 ? "s" : ""));
}

function timeTick() {
	showTime();
}
