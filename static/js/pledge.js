
var gsituation, gcounter = 0, gend = true;
function pledgeAlgo(speed) {
	if (algoExit) {
		clearTimeouts();
		gend = true;
		algoExit = false;
		$('#tremaux-algo').removeClass().addClass('btn');
		$('#hand-algo').removeClass().addClass('btn');
		$("#run-code").removeClass().addClass('btn btn-default');
		return ;
	}
	if(!mazeGame.foundExit()) {
		gend = false;
		gsituation = mazeGame.getSituation();
		try {
			if (gcounter === 0) {
				if (gsituation.up === false) {
					moveDir("up", true);
				} else {
					moveDir("left", true);
					gcounter -= 1;
				}
			} else {	//along with right-hand
				if (gsituation.right === false) {
					moveDir("right", true);
					gcounter += 1;
					moveDir("up", true);
				} else if (gsituation.up === false) {
					moveDir("up", true);
				} else if (gsituation.left === false) {
					moveDir("left");
					gcounter -= 1;
					moveDir("up");
				} else {
					moveDir("left", true);
					gcounter -= 1;
					moveDir("left", true);
					gcounter -= 1;
					moveDir("up", true);
				}
			}
		} catch (e) {
			console.log('pledge catch.');
			gend = true;
		}

		id = window.setTimeout(function() {
			pledgeAlgo(speed);
		}, speed);	
	} else {
		$('#tremaux-algo').removeClass().addClass('btn');
		$('#hand-algo').removeClass().addClass('btn');
		$("#run-code").removeClass().addClass('btn btn-default');
		gend = true;
	}
}

function rightHand(speed) {
	if (algoExit) {
		clearTimeouts();
		gend = true;
		algoExit = false;
		$('#tremaux-algo').removeClass().addClass('btn');
		$('#pledge-algo').removeClass().addClass('btn');
		$("#run-code").removeClass().addClass('btn btn-default');
		return ;
	}
	if(!mazeGame.foundExit()) {
		gend = false;
		gsituation = mazeGame.getSituation();
		try {		
			if (gsituation.right === false) {
				moveDir("right", true);
				moveDir("up", true);
			} else if (gsituation.up === false) {
				moveDir("up", true);
			} else if (gsituation.left === false) {
				moveDir("left", true);
				moveDir("up", true);
			} else {
				moveDir("left", true);
				moveDir("left", true);
				moveDir("up", true);
			}
		} catch (e) {
			console.log('right hand catch.');
			gend = true;
		}

		id = window.setTimeout(function() {
			rightHand(speed);
		}, speed);	
	} else {
		console.log('right hand end.');
		gend = true;
	}
}

function Controller(walker) {
	this.end = true;
	this.init = function() {
		this.algorithm = new TremauxAlgo(walker);
	};
	this.run = function() {
		if (algoExit) {
			clearTimeouts();
			this.end = true;
			algoExit = false;
			$('#pledge-algo').removeClass().addClass('btn');
			$('#hand-algo').removeClass().addClass('btn');
			$("#run-code").removeClass().addClass('btn btn-default');
			return ;
		}
		if (!this.algorithm.isDone()) {
			this.end = false;
			this.algorithm.step();
			
			var that = this;
			id = window.setTimeout(function() {
				that.run();
			}, 100);
		} else {
			// $('#hand-algo').removeClass().addClass('btn');
			// $('#pledge-algo').removeClass().addClass('btn');
			// $("#run-code").removeClass().addClass('btn btn-default');
			this.end = true;
		}
	};
}

// walker: mazeGame
function TremauxAlgo(walker) {
	this.numToDir = {
		0: "up",
		1: "right",
		2: "down",
		3: "left"
	};
	this.walker = walker;
	// this.direction = 0,	// 0: up, 1: right, 2: down, 3: left
	if (this.walker.getCurrentPos().dir == 'up') {
		this.direction = 0;
	} else if (this.walker.getCurrentPos().dir == 'right') {
		this.direction = 1;
	} else if (this.walker.getCurrentPos().dir == 'down') {
		this.direction = 2;
	} else if (this.walker.getCurrentPos().dir == 'left') {
		this.direction = 3;
	};
	// this.end = walker.maze.end,
	this.mazeSize = this.walker.getSizeofMaze();

	this.step = function() {
		// console.log('current dir:' + this.walker.getCurrentPos().dir);

		var startingDirection = this.direction;
		while (!this.walker.moveInTremaux(this.numToDir[this.direction])) {
			// Hit a wall. Turn to the right.		
			this.direction++;

			if (this.direction > 3) {
				this.direction = 0;
			}
			
			if (this.direction == startingDirection) {
				// We've turned in a complete circle with no new path available. Time to backtrack.
				while (!this.walker.moveInTremaux(this.numToDir[this.direction], true)) {
					// Hit a wall. Turn to the right.
					this.direction++;
					
					if (this.direction > 3) {
						this.direction = 0;
					}
				}

				break;
			}
		}
	};
	
	this.isDone = function() {
		return this.walker.foundExit();
	};
	
	this.solve = function() {
		// Draw solution path.
		for (var y = 0; y < this.mazeSize.height; y++) {
			for (var x = 0; x < this.mazeSize.width; x++) {
				if (this.walker.getVisited[x][y] == 1) {
					this.walker.context.fillStyle = 'red';
					this.walker.context.fillRect(x * 10, y * 10, 10, 10);					
				}
			}
		}
	};
}


