var gUsername, algoExit = false, taskId = 0;
var mazeGame, controller, workspace, moveList = [], modalIsHided = false;
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


function initApi(interpreter, scope) {
 	var wrapper = function(id) {
    	id = id ? id.toString() : '';
    	return interpreter.createPrimitive(workspace.highlightBlock(id));
	};
	interpreter.setProperty(scope, 'highlightBlock',
	      interpreter.createNativeFunction(wrapper));

  	wrapper = function(dir) {
    	moveDir(dir, true);
  	};
  	interpreter.setProperty(scope, 'moveDir',
      interpreter.createNativeFunction(wrapper));

   	wrapper = function() {
    	return !mazeGame.foundExit();
  	};
	interpreter.setProperty(scope, 'notDone',
	  interpreter.createNativeFunction(wrapper));

	wrapper = function(dir) {
    	return !mazeGame.getSituation()[dir];
  	};
	interpreter.setProperty(scope, 'isPathFree',
	  interpreter.createNativeFunction(wrapper));

	wrapper = function() {
    	return mazeGame.getAngle();
  	};
	interpreter.setProperty(scope, 'getAngle',
	  interpreter.createNativeFunction(wrapper));

	wrapper = function() {
    	return mazeGame.placeMark();
  	};
	interpreter.setProperty(scope, 'placeMark',
	  interpreter.createNativeFunction(wrapper));

	wrapper = function() {
    	return mazeGame.markPlaced();
  	};
	interpreter.setProperty(scope, 'markPlaced',
	  interpreter.createNativeFunction(wrapper));

	wrapper = function(s) {
    	return console.log(s);
  	};
	interpreter.setProperty(scope, 'log',
	  interpreter.createNativeFunction(wrapper));

}

$(document).ready(function () {
	mazeGame = new MazeGame(document.getElementById('maze'), mazeOptions);
	controller = new Controller(mazeGame);

	workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')});
  	Blockly.Xml.domToWorkspace(workspace, blocklyDiv);
  	// For test. Basic Algo
	// var workspaceBlocks = document.getElementById("workspaceBlocks"); 
	/* Load blocks to workspace. */
	// Blockly.Xml.domToWorkspace(workspace, workspaceBlocks);

  	$("#run-code").click(function () {
  		if ($(this).text() === 'Zurücksetzen') {
  			algoExit = true;
		  	mazeGame.reset();
  			$(this).text('Programm Ausführen');
  			$('#hand-algo').removeClass().addClass('btn');
			$('#tremaux-algo').removeClass().addClass('btn');
			$('#pledge-algo').removeClass().addClass('btn');
			$('#game-mode').removeClass().addClass('btn navbar-btn navbar-link');
  		} else {
  			$(this).text('Zurücksetzen');
  			$('#hand-algo').removeClass().addClass('disabled btn');
			$('#tremaux-algo').removeClass().addClass('disabled btn');
			$('#pledge-algo').removeClass().addClass('disabled btn');
			$('#game-mode').removeClass().addClass('disabled btn navbar-btn');
			algoExit = false;
  			mazeGame.reset();

	        var code = Blockly.JavaScript.workspaceToCode(workspace);
	        var myInterpreter = new Interpreter(code, initApi);
			function nextStep() {
				if (algoExit) {
		  			clearTimeouts();
		  			algoExit = false;
		  			$('#hand-algo').removeClass().addClass('btn');
					$('#tremaux-algo').removeClass().addClass('btn');
					$('#pledge-algo').removeClass().addClass('btn');
					$('#game-mode').removeClass().addClass('btn navbar-btn navbar-link');
		  			return ;
				}
				try {
					if (myInterpreter.step()) {
						taskId = window.setTimeout(nextStep, 8);
					} 
				} catch (e) {
					// alert('eine Wand getroffen.')
					if (mazeGame.getMsgType().WALL) {
						alert('Treffe eine Wand, bewege nicht weiter.');
					} else if (mazeGame.getMsgType().MARK) {
						alert('Marker liegt vor.');
					} else if (mazeGame.getMsgType().CIRCLE) {
						alert('Drehe sich um 360 Grad.');
					} 
					algoExit = true;
					clearTimeouts();
					$('#hand-algo').removeClass().addClass('btn');
					$('#tremaux-algo').removeClass().addClass('btn');
					$('#pledge-algo').removeClass().addClass('btn');
				}
			}
		
			nextStep();
  		}
        // console.log(code);
        // try {
        //     eval(code);
        // } catch (e) {
        //     alert(e);
        // }
    });

	$("#options form").on('submit', function () {
		mazeOptions.level_size = [$('#w').val(), $('#h').val()];
		mazeOptions.levelOption = $('#level-option input:radio:checked').val();
		$('#action-list').text('');
		$('#rule-list').text('');
		mazeGame = new MazeGame(document.getElementById('maze'), mazeOptions);
		controller = new Controller(mazeGame);
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

	$('[data-toggle="popover"]').popover();
	initJokerEvent();

	$('#game-mode span').on('click', function() {
		var game_mode = $(this).text();
		if (game_mode === 'Blockly') {
			$(this).text('Regel');
			$('#mode-blockly').show();
			Blockly.Xml.domToWorkspace(workspace, blocklyDiv);
			$('#reset-maze').hide();
			$('#mode-rule').hide();
			$('#new-rule').hide();
			$('#run-solution').hide();
		} else if (game_mode === 'Regel') {
			$(this).text('Blockly');
			$('#mode-blockly').hide();
			$('#reset-maze').show();
			$('#mode-rule').show();
			$('#new-rule').show();
			$('#run-solution').show();
		} else {
			$(this).text('Regel');
			$('#mode-blockly').hide();
			$('#reset-maze').show();
			$('#mode-rule').show();
			$('#new-rule').show();
			$('#run-solution').show();
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
					// console.log(data);
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
					alert(data.msg);
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
					// console.log(data.res);
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
			// console.log('actionsText:' + actionsText)
			if (!actionsText) {
				alert('no rule for this situation.');
			}
			mazeGame.saveCurPos();
			do {
				if (simulateActions(actionsText) === false) {
					break;
				}
				// update the rule (actions)
				actionsText = mazeGame.getActionsOfSituation();
			} while (mazeGame.isSituationExisted());

			executeActions(moveList);
		}

		// } else if ($('#game-mode span').text() === 'Regel') {
	 //        var code = Blockly.JavaScript.workspaceToCode(workspace);
	 //        console.log(code);
	 //        try {
	 //            eval(code);
	 //        } catch (e) {
	 //            alert(e);
	 //        }
		// }
	});

	$('#clear-tables').on('click', function() {
		$('#rule-list').html('');
		$('#action-list').html('');
		mazeGame.resetSolution();
		$('#run-solution').prop("disabled",true);
	});

	$('#new-rule').on('click', function() {
		$('#alert-msg span').text('Stelle neue Regel.')
		showSituation();
	});

	$('#rule-list').delegate('a', 'click', function() {
		console.log($(this).attr('name'));
		mazeGame.removeRule($(this).attr('name'));
		$(this).parent().parent().remove();
	});

	$('#action-list').delegate('a', 'click', function() {
		mazeGame.removeRule($(this).attr('name'));
		$(this).parent().remove();
	});

	// $('#place-mark').on('click', function() {
	// 	mazeGame.placeMark();
	// 	showSituation();
	// });

	$('#mymark').on('click', function() {
		var str = $(this).text();
		if (str === "Marker") {
			mazeGame.removeMark();
			$(this).text('Kein Marker');
			showSituation();
		} else {
			mazeGame.placeMark();
			$(this).text('Marker');
			showSituation();
		}
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

	var statusToBoolean = {
		Frei: false,
		Belegt: true
	};

	$('#execute-action').on('click', function() {
		let actionsText = $('#actions').val(), 
			rule = {
				front: $('#myup').text() !== "Joker" ? $('#myup').text().substring(6):$('#myup').text(), 
				left: $('#myleft').text() !== "Joker" ? $('#myleft').text().substring(6):$('#myleft').text(),
				right: $('#myright').text() !== "Joker" ? $('#myright').text().substring(7):$('#myright').text(),
				actions: $('#actions').val()
			},
			situ = {
				front: $('#myup').text() !== "Joker" ? statusToBoolean[$('#myup').text().substring(6)]:undefined, 
				left: $('#myleft').text() !== "Joker" ? statusToBoolean[$('#myleft').text().substring(6)]:undefined,
				right: $('#myright').text() !== "Joker" ? statusToBoolean[$('#myright').text().substring(7)]:undefined,
			};
		console.log(situ);
		if (!actionsText) {
			return;
		}
		$('#actions').val('');
		// 1. store rule
		mazeGame.setSituation(true, actionsText);
		// 2. show rule
		var ruleSelector = $('#rule-list tr a[name=\"' + mazeGame.indexOfSituations(situ) + '\"]');
		console.log('length:' + ruleSelector.length);	
		// console.log('#rule-list tr a[name=\"' + mazeGame.indexOfSituations(situ) + '\"]');
		if (ruleSelector.length) {
			var tdChild = ruleSelector.parent();
			tdChild.html(rule.actions + ruleSelector.clone()[0].outerHTML);
		} else {
			$('#rule-list').append('<tr><td>' + rule.front + '</td>' 
			 + '<td>'+ rule.left + '</td>'
			 + '<td>' + rule.right + '</td>' 
			 + '<td>' + rule.actions
			 // + '<a class="badge" name="' + mazeGame.nextRuleNo() 
			 + '<a class="badge" name="' + mazeGame.indexOfSituations(situ)
			 + '" style="float: right">' + '&times;</a></td></tr>');
		}
		
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
			if (!actionsText) {
				break;
			}
			console.log('actionsText:' + actionsText);
		} while (mazeGame.isSituationExisted());

		executeActions(moveList);
	});

	showRule();

	$('#reset-maze').on('click', function() {
		$('#action-list').text('');
		$('#rule-list').text('');
		mazeGame.reset();
		algoExit = true;
		$('#tremaux-algo').removeClass().addClass('btn');
		$('#hand-algo').removeClass().addClass('btn');
		$("#run-code").removeClass().addClass('btn btn-default');
		$("#game-mode").removeClass().addClass('btn navbar-btn navbar-link');
		
	});

	$('#hand-algo').on('click', function() {
		$('#action-list').text('');
		$('#rule-list').text('');
		if ($(this).text() === 'Zurücksetzen') {
			$(this).text('Algo 1');
			mazeGame.reset();
			algoExit = true;
			$('#reset-maze').removeClass().addClass('btn');
			$('#tremaux-algo').removeClass().addClass('btn');
			$('#pledge-algo').removeClass().addClass('btn');
			$("#run-code").removeClass().addClass('btn btn-default');
			$("#game-mode").removeClass().addClass('btn navbar-btn navbar-link');
		} else {
			if (gend) {
				$(this).text('Zurücksetzen');
				$('#reset-maze').removeClass().addClass('disabled btn');
				$('#tremaux-algo').removeClass().addClass('disabled btn');
				$('#pledge-algo').removeClass().addClass('disabled btn');
				$("#run-code").removeClass().addClass('disabled btn');
				$("#game-mode").removeClass().addClass('disabled btn navbar-btn');
				algoExit = false;
				mazeGame.reset();
				rightHand(300);	
			} else {
				$(this).text('Algo 1');
				mazeGame.reset();
				algoExit = true;
			}
		}
		
	});

	//Algo 2
	$('#pledge-algo').on('click', function() {
		$('#action-list').text('');
		$('#rule-list').text('');
		if ($(this).text() === 'Zurücksetzen') {
			$(this).text('Algo 2');
			mazeGame.reset();
			algoExit = true;
			$('#reset-maze').removeClass().addClass('btn');
			$('#tremaux-algo').removeClass().addClass('btn');
			$('#hand-algo').removeClass().addClass('btn');
			$("#run-code").removeClass().addClass('btn btn-default');
			$("#game-mode").removeClass().addClass('btn navbar-btn navbar-link');
		} else {
			if (gend) {
				$(this).text('Zurücksetzen');
				$('#reset-maze').removeClass().addClass('disabled btn');
				$('#hand-algo').removeClass().addClass('disabled btn');
				$('#tremaux-algo').removeClass().addClass('disabled btn');
				$("#run-code").removeClass().addClass('disabled btn');
				$("#game-mode").removeClass().addClass('disabled btn navbar-btn');
				algoExit = false;
				mazeGame.reset();
				pledgeAlgo(300);	
			} else {
				$(this).text('Algo 2');
				mazeGame.reset();
				algoExit = true;
			}
		}
		
	});

	$('#tremaux-algo').on('click', function() {
		$('#action-list').text('');
		$('#rule-list').text('');
		// console.log('[end]' + controller.end);
		if ($(this).text() === 'Zurücksetzen') {
			$(this).text('Algo 3');
			mazeGame.reset();
			algoExit = true;
			$('#reset-maze').removeClass().addClass('btn');
			$('#pledge-algo').removeClass().addClass('btn');
			$('#hand-algo').removeClass().addClass('btn');
			$("#run-code").removeClass().addClass('btn btn-default');
			$("#game-mode").removeClass().addClass('btn navbar-btn navbar-link');
		} else {
			if (controller.end) {
				$(this).text('Zurücksetzen');
				$('#reset-maze').removeClass().addClass('disabled btn');
				$('#hand-algo').removeClass().addClass('disabled btn');
				$('#pledge-algo').removeClass().addClass('disabled btn');
				$("#run-code").removeClass().addClass('disabled btn');
				$("#game-mode").removeClass().addClass('disabled btn navbar-btn');
				algoExit = false;
				mazeGame.reset();
				controller.init();
				controller.run();
			} else {
				$(this).text('Algo 3');
				mazeGame.reset();
				algoExit = true;
			}
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
	$('#run-solution').prop("disabled", false);
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
		var xml = Blockly.Xml.textToDom(solution.code);
		Blockly.Xml.domToWorkspace(xml, workspace);
	}
}

function showRule() {
	$('#game-mode span').text('Blockly');
	$('#mode-blockly').hide();
	$('#mode-rule').show();
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
		} else {
			alert("Geben L,V,R ein, L:links, V:vrowärt, R:rechts");
			return false;
		}
	}
}

function simulateMoveDir(dir, inAlgo=false) {

	let forwardDir = mazeGame.getForwardDir(dir);

	if (!mazeGame.simulateMove(forwardDir, inAlgo)) {
		return false;
	}

	return true;
}


function moveDir(dir, inAlgo=false) {

	let forwardDir = mazeGame.getForwardDir(dir);
	
	// show all steps if game mode is Regel.
	if ($('#game-mode span').text() === 'Blockly') {
		showCurrentStatus(forwardDir);
	}

	if (!mazeGame.move(forwardDir, inAlgo)) {
		throw false;
	}

	return true;
}

function executeActions(actions) {
	mazeGame.restoreCurPos();
	let i = 0,len = actions.length;
	var wrapperMoveDir = function() {
		setTimeout(function() {
			try{
				moveDir(actions[i++]);
			} catch (e) {
				initModal();
			}
			if (i < len) {
				wrapperMoveDir();
			} else {
				initModal();
			}

			
		}, 200);
	};
	wrapperMoveDir();
}

function initModal() {
	moveList = [];
	if (!mazeGame.foundExit()) {
		// console.log(mazeGame.getMsgType());
		if (!modalIsHided) {
			$('#situation-modal').off('hidden.bs.modal').one('hidden.bs.modal', function (e) {
				if (mazeGame.getMsgType().WALL) {
					$('#alert-msg span').text('Treffe eine Wand, bewege nicht weiter.');
				} else if (mazeGame.getMsgType().MARK) {
					$('#alert-msg span').text('Marker liegt vor.');
				} else if (mazeGame.getMsgType().CIRCLE) {
					$('#alert-msg span').text('Gehe in eine Schleife.');
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
				$('#alert-msg span').text('Gehe in eine Schleife.');
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

function initJokerEvent() {
	$('#myup').on('click', function() {
		let s = mazeGame.getSituation(), str = $('#myup').text();
		if (str === "Joker") {
			if (s.up) {
				$('#myup').removeClass().addClass("btn btn-default");
				$('#myup').text("Vorne Belegt");
			} else {
				$('#myup').removeClass().addClass("btn btn-success");
				$('#myup').text("Vorne Frei");
			}
			mazeGame.setJoker("up", false);
		} else {
			$('#myup').removeClass().addClass("btn btn-info");
			$('#myup').text("Joker");
			mazeGame.setJoker("up", true);
		}

	});
	$('#myleft').on('click', function() {
		let s = mazeGame.getSituation(), str = $('#myleft').text();
		if (str === "Joker") {
			if (s.left) {
				$('#myleft').removeClass().addClass("btn btn-default");
				$('#myleft').text("Vorne Belegt");
			} else {
				$('#myleft').removeClass().addClass("btn btn-success");
				$('#myleft').text("Vorne Frei");
			}
			mazeGame.setJoker("left", false);
		} else { // place joker
			$('#myleft').removeClass().addClass("btn btn-info");
			$('#myleft').text("Joker");
			mazeGame.setJoker("left", true);
		}
	});
	$('#myright').on('click', function() {
		let s = mazeGame.getSituation(), str = $('#myright').text();
		if (str === "Joker") {
			if (s.right) {
				$('#myright').removeClass().addClass("btn btn-default");
				$('#myright').text("Vorne Belegt");
			} else {
				$('#myright').removeClass().addClass("btn btn-success");
				$('#myright').text("Vorne Frei");
			}
			mazeGame.setJoker("right", false);
		} else {
			$('#myright').removeClass().addClass("btn btn-info");
			$('#myright').text("Joker");
			mazeGame.setJoker("right", true);
		}
	});
}

function showSituation() {
	if (mazeGame) {

		let situation = mazeGame.getSituation();

		if (situation["up"] === false) {
			$('#myup').removeClass().addClass("btn btn-success");
			$('#myup').text("Vorne Frei");
		} else {
			$('#myup').removeClass().addClass("btn btn-default");
			$('#myup').text("Vorne Belegt");
		}
		if (situation["left"] === false) {
			$('#myleft').removeClass().addClass("btn btn-success");
			$('#myleft').text("Links Frei");
		} else {
			$('#myleft').removeClass().addClass("btn btn-default");
			$('#myleft').text("Links Belegt");
		}
		if (situation["right"] === false) {
			$('#myright').removeClass().addClass("btn btn-success");
			$('#myright').text("Rechts Frei");
		} else {
			$('#myright').removeClass().addClass("btn btn-default");
			$('#myright').text("Rechts Belegt");
		}

		if (situation["mark"]) {
			$('#mymark').removeClass().addClass("btn btn-success");
			$('#mymark').text("Marker");
		} else {
			$('#mymark').removeClass().addClass("btn btn-default");
			$('#mymark').text("Kein Marker");
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

function clearTimeouts() {
	while (taskId) {
		clearTimeout(taskId);
		taskId--;
	}
}
