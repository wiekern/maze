function pledgeAlgo() {
	var situation, counter = 0;
	while (!mazeGame.foundExit()) {
		situation = mazeGame.getSituation();
		if (counter === 0) {
			if (situation.up === false) {
				moveDir("up");
			} else {
				moveDir("right");
				counter -= 1;
			}
		} else {	//along with left-hand
			if (situation.left === false) {
				moveDir("left");
				counter += 1;
				moveDir("up");
			} else if (situation.up === false) {
				moveDir("up");
			} else if (situation.right === false) {
				moveDir("right");
				counter -= 1;
				moveDir("up");
			} else {
				moveDir("right");
				counter -= 1;
				moveDir("right");
				counter -= 1;
				moveDir("up");
			}
		}	
	}
}

var gsituation, gcounter = 0;
function pledgeAlgoWithTimeout(speed) {
	if(!mazeGame.foundExit()) {
		gsituation = mazeGame.getSituation();
		if (gcounter === 0) {
			if (gsituation.up === false) {
				moveDir("up");
			} else {
				moveDir("right");
				gcounter -= 1;
			}
		} else {	//along with left-hand
			if (gsituation.left === false) {
				moveDir("left");
				gcounter += 1;
				moveDir("up");
			} else if (gsituation.up === false) {
				moveDir("up");
			} else if (gsituation.right === false) {
				moveDir("right");
				gcounter -= 1;
				moveDir("up");
			} else {
				moveDir("right");
				gcounter -= 1;
				moveDir("right");
				gcounter -= 1;
				moveDir("up");
			}
		}
		window.setTimeout(function() {
			pledgeAlgoWithTimeout(speed);
		}, speed);	
	}
}

function Controller(walker) {
	this.algorithm = new TremauxAlgo(walker);
	this.run = function() {
		if (!this.algorithm.isDone()) {
			this.algorithm.step();
			
			var that = this;
			window.setTimeout(function() {
				that.run();
				console.log('timeout');
			}, 100);
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
		while (!walker.moveInTremaux(this.numToDir[this.direction])) {
			// Hit a wall. Turn to the right.		
			// console.log('!!' + this.numToDir[this.direction]);
			this.direction++;

			if (this.direction > 3) {
				this.direction = 0;
			}
			
			// console.log(this.direction == startingDirection);
			if (this.direction == startingDirection) {
				// console.log('360 ' + this.numToDir[this.direction]);
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
		// this.walker.drawPathInTremaux();
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
