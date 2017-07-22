function MazeGame(canvas, options) {
	var default_options = {
		colors: {
			walls: "#ee4646",
			current_position: "#67b9e8",
			finish: "#65c644",
			visited_block: "#d7edff"
		},
		starting_position: { x: 0, y: 0, dir: "right"},
		level_size: [10, 10],
		offset: {x: 0, y: 0},
		scale: 54,
		user_diameter: 4,
		user_path_width: 8,
		onStart: function(){},
		onGameEnd: function(){},
		onMove: function(){}
	}
	
	// todo: don't use jQuery here
	options = $.extend({}, default_options, options);

	$(window).on('resize', center);
	
	var ctx, oldPos, currentPos, startAngle = 0, maze, path, gameInProgress, visitedCrossPostions;
	var faceTos = {
		up: {up:"up", down: "down", left:"left", right:"right"}, //north
		down: {up:"down", down: "up", left:"right", right:"left"},//south
		left : {up:"left", down: "right", left:"down", right:"up"},//west
		right : {up:"right", down: "left", left:"up", right:"down"}//east
	};
	// recording action under all possible situations.
	// up down left right, 0: free, 1: rand
	// ["0000", "0001", "0010", "0011", 
	// 	"0100", "0101", "0110", "0111",
	// 	"1000", "1001", "1010", "1011",
	// 	"1100", "1101", "1110", "1111"];
	var situations = Array(16),
		actions = Array(16),
		actionList = [];
	var offsets = {
		left	:	{ x: -1, y: 0 },
		up	:	{ x: 0, y:	-1 },
		right	:	{ x: 1, y: 0 },
		down	:	{ x: 0, y: 1 }
	};
	var sx, sy, dx, dy, imgX, imgY;
	var img = new Image();

	// width: 1029, height: 51, 21 mans
	// 49px width/man
	var manWidth = 49, manHeight = 51;
	var manDirections = {
		up	: 	{x: 0, y: 0},
		right	: 	{x: 4 * manWidth, y: 0},
		down	: 	{x: 8 * manWidth, y: 0},
		left 	: 	{x: 12 * manWidth, y: 0}
	};
	var directions = {
		left : 	"left",
		up   : 	"up",
		right: 	"right",
		down : 	"down"
	};

	var rand = new Rand();
	
	this.init = function() {
		if (canvas.getContext) {
			ctx = canvas.getContext("2d");
			setup(options.level_size[0], options.level_size[1]);
			start();
		}
	}
	
	this.init();
	
	function Cell(x, y) {
		this.visited = false;
		this.up = true; // a wall up itself
		this.right = true; // a wall on the right side of itself
		this.down = true;	
		this.left = true;
		this.x = x;
		this.y = y;
	}
	
	function Rand() {
		this.randomInt = function (x) {
			return Math.floor(Math.random() * x);
		};
		this.pickRand = function (al) {
			return al[this.randomInt(al.length)];
		};
	}
	
	function Maze(width, height) {
		this.m = [];
		this.width = width; // size
		this.height = height;
		this.start = options.starting_position;
		this.end = {
			x: this.width - 1,
			y: this.height - 1
		};
		this.hasIsland = false;
		this.island;
		this.c;
		this.nextC;
		this.stack = [];
		this.initMaze = function () {
			for (y = 0; y < height; y++) {
				this.m.push(new Array());
				for (x = 0; x < width; x++) {
					this.m[y].push(new Cell(x, y));
				}
			}
		};
		this.getNeighbors = function (x, y) {
			var n = [];
			var c = this.getCell(x, y);
			if (y != 0) {
				n.push(this.getCell(x, y - 1));
			}
			if (y != height - 1) {
				n.push(this.getCell(x, y + 1));
			}
			if (x != 0) {
				n.push(this.getCell(x - 1, y));
			}
			if (x != width - 1) {
				n.push(this.getCell(x + 1, y));
			}
			return n;
		};
		this.setEightNeighbors = function (x, y) {
			var n = [];
			var c = this.getCell(x, y);
			// up
			if (y != 0) {
				// n.push(this.getCell(x, y - 1));
				this.getCell(x, y - 1).down = true;
				this.getCell(x, y - 1).left = false;
				this.getCell(x, y - 1).right = false;
			}
			// down
			if (y != height - 1) {
				// n.push(this.getCell(x, y + 1));
				this.getCell(x, y + 1).up = true;
				this.getCell(x, y + 1).left = false;
				this.getCell(x, y + 1).right = false;
			}
			// left
			if (x != 0) {
				// n.push(this.getCell(x - 1, y));
				this.getCell(x - 1, y).right = true;
				this.getCell(x - 1, y).up = false;
				this.getCell(x - 1, y).down = false;
			}
			// right
			if (x != width - 1) {
				// n.push(this.getCell(x + 1, y));
				this.getCell(x + 1, y).left = true;
				this.getCell(x + 1, y).up = false;
				this.getCell(x + 1, y).down = false;
			}
			// left up
			if ((y != 0) && (x != 0)) {
				// n.push(this.getCell(x - 1, y - 1));
				this.getCell(x - 1, y - 1).right = false;
				this.getCell(x - 1, y - 1).down = false;
			}
			// left down
			if ((y != height - 1) && (x != 0)) {
				// n.push(this.getCell(x - 1, y + 1));
				this.getCell(x - 1, y + 1).up = false;
				this.getCell(x - 1, y + 1).right = false;
			}
			// right up 
			if ((y != 0) && (x != width - 1)) {
				// n.push(this.getCell(x + 1, y - 1));
				this.getCell(x + 1, y - 1).left = false;
				this.getCell(x + 1, y - 1).down = false;
			}
			//right down
			if ((y != height - 1) && (x != width - 1)) {
				// n.push(this.getCell(x + 1, y + 1));
				this.getCell(x + 1, y + 1).left = false;
				this.getCell(x + 1, y + 1).up = false;
			}
			// return n;			
		};
		this.availableNeighbors = function (x, y) {
			var list = [];
			var neighbors = this.getNeighbors(x, y);
			for (i = 0; i < neighbors.length; i++) {
				if (!neighbors[i].visited) list.push(neighbors[i]);
			}
			return list;
		};
		this.randomNeighbor = function (x, y) {
			return rand.pickRand(this.availableNeighbors(x, y));
		};
		this.breakWall = function (c1, c2) { //break the wall between cell c1 and c2
			if (c1.x == c2.x) {
				if (c1.y < c2.y) {
					c1.down = false;
					c2.up = false;
				}
				if (c1.y > c2.y) {
					c1.up = false;
					c2.down = false;
				}
			} else if (c1.y == c2.y) {
				if (c1.x < c2.x) {
					c1.right = false;
					c2.left = false;
				}
				if (c1.x > c2.x) {
					c1.left = false;
					c2.right = false;
				}
			}
		};
		this.getCell = function (x, y) {
			return this.m[y][x];
		};
		this.inBounds = function (x, y) {
			if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
				return true;
			}
			return false;
		};
		this.isDeadEnd = function (x, y) {
			var neighbors = this.getNeighbors(x, y);
			for (i = 0; i < neighbors.length; i++) {
				if (!neighbors[i].visited) return false;
			}
			return true;
		};
		this.isStart = function (x, y) {
			if (this.start.x === x && this.start.y === y) return true;
			return false;
		};
		this.isEnd = function (x, y) {
			if (this.end.x === x && this.end.y === y) return true;
			return false;
		};
		this.isEdge = function (x, y) {
			if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
				return true;
			} else {
				return false;
			}
		};
		this.generateMaze = function () {
			this.c = this.getCell(rand.randomInt(this.width), rand.randomInt(this.height));
			this.c.visited = true;
			this.mazeDo();
			while (this.stack.length !== 0) {
				if (this.isDeadEnd(this.c.x, this.c.y) || this.isEnd(this.c.x, this.c.y) || this.isStart(this.c.x, this.c.y)) {
					this.nextC = this.stack.pop();
					this.c = this.nextC;
				} else {
					this.mazeDo();
				}
			}
			this.generateIsland();
		};
		this.mazeDo = function () {
			if (!this.isEdge(this.c.x, this.c.y) && !this.hasIsland) {
				this.island = this.c;
				this.hasIsland = true
			}
			this.nextC = this.randomNeighbor(this.c.x, this.c.y);
			this.nextC.visited = true;
			this.breakWall(this.c, this.nextC);
			this.stack.push(this.c);
			this.c = this.nextC;
		};
		this.generateIsland = function() {
			this.island.up = true;
			this.island.down = true;
			this.island.left = true;
			this.island.right = true;
			this.setEightNeighbors(this.island.x, this.island.y);
		};
		this.initMaze();
		this.generateMaze();

	}
	
	function setup(height, width) {
		maze = new Maze(height, width);
		currentPos = options.starting_position;
		path = [];
		path.push(currentPos);
		visitedCrossPostions = [];
		if (isCrossPos(currentPos)) {
			visitedCrossPostions.push(currentPos);
		}
		center();

		// choosing a direction to which the tiny man faces.
		let neighbor = maze.randomNeighbor(currentPos.x, currentPos.y),
			currentCell = maze.getCell(0, 0);
		if (currentCell.right === false) {
			currentPos.dir = "right";
			// startAngle = 0;
		} else if (currentCell.down === false) {
			currentPos.dir = "down";
			// startAngle = 270;
		} else {
			console.log("The maze not produced incorrectly.")
		}
		// record position
		oldPos = currentPos;
		console.log('setup:' + oldPos.dir);
	}

	function center() {
		canvas.width = maze.width * options.scale + 3;
		canvas.height = maze.height * options.scale + 3;
		// canvas.width = $('body').width();
		// canvas.height = $('body').height();
		// options.offset.x = Math.floor((canvas.width / 2) - (maze.width * options.scale / 2));
		// options.offset.y = Math.floor((canvas.height / 2) - (maze.height * options.scale / 2));
		$("#a").width(maze.width * options.scale + 3).css('padding-top', (canvas.height / 2) - (maze.height * options.scale / 2) - $('h1').height());
		$("#time, #steps").css('margin-top', maze.height * options.scale);
		draw();
	}
	
	function start() {
		gameInProgress = true;
		options.onStart();
	}
	
	function draw() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawPath();
		drawMaze();
	}

	function isCrossPos(pos) {
		console.log("isCrossPos" + pos.dir + faceTos);
		let cell = maze.getCell(pos.x, pos.y),
			f = faceTos[pos.dir],
			exits = 0;
		if (!cell[f.up]) {
			exits += 1;
		}
		if (!cell[f.left]) {
			exits += 1;
		}
		if (!cell[f.right]) {
			exits += 1;
		}

		if (exits == 3) {
			console.log("cross pos: true")
			return true;
		} else {
			console.log("cross pos: false")
			return false;
		}
	}

	this.getCurrentStatus = function() {
		return {
			faceTo: currentPos.dir,
			x: currentPos.x,
			y: currentPos.y
		};
	};

	this.curPosInCrossPos = function() {
		for (var i = 0; i < visitedCrossPostions.length; i++) {
			if (visitedCrossPostions[i].x === currentPos.x && visitedCrossPostions[i].y === currentPos.y) {
				console.log("[curPosInCrossPos] true");
				return true;
			} else {
				console.log("[curPosInCrossPos] false");
				return false;
			}
		}
	};

	this.curPosInPath = function() {
		for (var i = path.length - 1; i >= 0; i--) {
			console.log(path[i]);
		}

		if (path.length <= 1) {
			console.log("[curPosInPath] false");
			return false;
		}

		for (var i = 0; i < path.length - 1; i++) {
			if (path[i].x === currentPos.x && path[i].y === currentPos.y) {
				console.log("[curPosInPath] true");
				return true;
			}
		}
		console.log("[curPosInPath] false");
		return false;
	};

	this.storeAction = function(action) {
		let i = this.getShortSituation();
		// console.log("store action:" + i + "..." + action);
		actions[i] = action;
	}

	this.setSituation = function(b) {
		let i = this.getShortSituation();
		situations[i] = b;
	}

	this.removeRule = function(i) {
		situations[i] = false;
		actions[i] = "";
	};

	this.isSituationExisted = function() {
		let i = this.getShortSituation();
		// console.log("situation:" + i + " " + situations[i]);
		if (situations[i] === true) {
			return true;
		} else {
			return false;
		}
	};

	this.getActionOfSituation = function() {
		let i = this.getShortSituation();
		// console.log("action of situation:" + i + "##" + actions[i])
		return actions[i];
	};

	this.getShortSituation = function() {
		let s = this.getSituation(),
			shortSituation = 0x0;
		if (s.up == true) {
			 shortSituation += 1 << 3;
		} 

		// if (s.down == true) {
		// 	shortSituation += 1 << 2;
		// } 

		if (s.left == true) {
			shortSituation += 1 << 1;
		} 

		if (s.right == true) {
			shortSituation += 1;
		} 

		// console.log("short:" + shortSituation);
		return shortSituation;
	};

	this.getLongSituation = function() {
		let cell = maze.getCell(currentPos.x, currentPos.y),
			faceTo = faceTos[currentPos.dir];

		return {
			up: cell[faceTo["up"]] === true? "Vorne B":"Vorne F",
			// "down": cell[faceTo["down"]] === true? "Hinten belegt":"Hinten frei",
			left: cell[faceTo["left"]] === true? "Links B":"Links F",
			right: cell[faceTo["right"]] === true? "Rechts B":"Rechts F"
		};
	};

	this.getSituation = function() {
		let cell = maze.getCell(currentPos.x, currentPos.y),
			faceTo = faceTos[currentPos.dir];

		return {
			up: cell[faceTo["up"]],
			down: cell[faceTo["down"]],
			left: cell[faceTo["left"]],
			right: cell[faceTo["right"]]
		};
	};

	this.isAtSamePos = function() {
		if (oldPos === currentPos) {
			return true;
		} else {
			return false;
		}
	};

	this.isMetWall = function(direction) {
		var newPos = {
			x: currentPos.x + offsets[direction].x,
			y: currentPos.y + offsets[direction].y,
			dir: direction
		};
		if (maze.getCell(currentPos.x, currentPos.y)[direction] === true) {
			return true;
		} else {
			return false;
		}
	};

	this.getForwardDir = function (turnTo) {
		updateAngle(turnTo);
		let f = faceTos[currentPos.dir];
		// console.log("[getForwardDir] pos:" + currentPos.x +" " + currentPos.y);
		// console.log('[getForwardDir] old dir:' + currentPos.dir + ',forward dir:' + f[turnTo]);
		return f[turnTo];
	};

	this.directionChanged = function () {
		let tmp = oldPos.dir !== currentPos.dir;
		// console.log('tmp:' + tmp);

		return oldPos.dir !== currentPos.dir;
	};

	this.situationChanged = function () {
		// console.log("situationChanged");
		let oldCell = maze.getCell(oldPos.x, oldPos.y),
			newCell = maze.getCell(currentPos.x, currentPos.y);
		if (oldCell === undefined || newCell === undefined) {
			return undefined;
		} else {
			if (oldCell.constructor === Cell && newCell.constructor === Cell) {

				let oldFaceTo = faceTos[oldPos.dir],
					newFaceTo = faceTos[currentPos.dir];
				// console.log('[situationChanged] oldfaceto:' + oldPos.dir +' newfaceto:' + currentPos.dir);

				if (oldCell[oldFaceTo["up"]] !== newCell[newFaceTo["up"]]) {
					// console.log('situation changed. 1');
					return true;
				}
				if (oldCell[oldFaceTo["down"]] !== newCell[newFaceTo["down"]]) {
					// console.log('situation changed. 2');
					return true;
				}
				if (oldCell[oldFaceTo["left"]] !== newCell[newFaceTo["left"]]) {
					// console.log('situation changed. 3');
					return true;
				}
				if (oldCell[oldFaceTo["right"]] !== newCell[newFaceTo["right"]]) {
					// console.log('situation changed. 4');
					return true;
				}

				// console.log('situation not changed.');
				return false;
			} else {
				console.log("incorrect type of inputs");
				return undefined;
			}
		}
	};

	var rotatedAngle = {
		left	:  90,
		right	: -90,
		up	: 0
	};
	
	function updateAngle(direction) {
		if (direction === "left" || direction === "right") {
			// console.log(direction + ":" + rotatedAngle[direction]);
			startAngle = startAngle + rotatedAngle[direction];
		}
	}

	this.getAngle = function() {
		console.log(startAngle)
		return startAngle;
	};

	function resetAngle() {
		startAngle = 0;
	}

	this.turnCircle = function() {
		if (this.getAngle() === 360 || this.getAngle() === -360) {
			resetAngle();
			return true;
		} else {
			return false;
		}
	};

	this.foundExit = function() {
		if (maze.isEnd(currentPos.x, currentPos.y)) {
			return true;
		} else {
			return false;
		}
	};

	this.move = function(direction) {
		oldPos = Object.assign({}, currentPos);
		// console.log('[move] oldPos:' + oldPos.dir + ' new dir:' + direction);
		// currentPos: old postion we needed, newPos is calculated new position namely current position.
		var newPos = {
			x: currentPos.x + offsets[direction].x,
			y: currentPos.y + offsets[direction].y,
			dir: direction
		};
		// if (gameInProgress && maze.inBounds(newPos.x, newPos.y)) {
		if (gameInProgress) {
			if (currentPos.dir === direction) {
				if (maze.getCell(currentPos.x, currentPos.y)[direction] === false) {
					path.push(newPos);
					if (isCrossPos(newPos)) {
						visitedCrossPostions.push(newPos);
					}
					currentPos = newPos;
					draw();
					showSteps();
					if (maze.isEnd(newPos.x, newPos.y)) {
						options.onGameEnd(true);
					}
				} else {
					console.log("meet a wall.");
				}
			} else {
				currentPos.dir = direction;
				// path.push(currentPos);
				// console.log('adjust direction from ' + oldPos.dir + ' to ' + currentPos.dir + ' at the same postion.');
				draw();
				showSteps();
				if (maze.isEnd(currentPos.x, currentPos.y)) {
					options.onGameEnd(true);
				}	
			}
		}
	}
	
	function drawPath() {
		// ctx.lineWidth = options.user_path_width;
		// ctx.strokeStyle = options.colors.visited_block;
		// ctx.beginPath();
		// ctx.moveTo(options.offset.x + 0.5 * options.scale, 0);
		// for (i = 0; i < path.length - 1; i++) {
		// 	ctx.lineTo(options.offset.x + (path[i].x + 0.5) * options.scale, options.offset.y + (path[i].y + 0.5) * options.scale);
		// }
		// ctx.lineTo(options.offset.x + (currentPos.x + 0.5) * options.scale, options.offset.y + (currentPos.y + 0.5) * options.scale);
		// ctx.stroke();
		animate();
		// circle(currentPos.x, currentPos.y, options.colors.current_position);
	}

	function manMoves() {
		//line width: 2
		ctx.clearRect(sx + 3, sy + 3, 49, 51);
		// console.log("manMoves" + sx + ":" + dx + "," + sy + ":" + dy);

		// draw path
		ctx.lineWidth = options.user_path_width;
		ctx.strokeStyle = options.colors.visited_block;
		ctx.beginPath();
		ctx.moveTo(options.offset.x + 0.5 * options.scale, 0);
		for (i = 0; i < path.length - 1; i++) {
			ctx.lineTo(options.offset.x + (path[i].x + 0.5) * options.scale, options.offset.y + (path[i].y + 0.5) * options.scale);
		}
		ctx.lineTo(options.offset.x + (currentPos.x + 0.5) * options.scale, options.offset.y + (currentPos.y + 0.5) * options.scale);
		ctx.stroke();

		// draw man
		ctx.drawImage(img, imgX, imgY, 49, 51, sx, sy, 49, 51);

		if (dx - sx > 0) {
			sx = sx + 1;
		} else if (dx - sx < 0) {
			sx = sx - 1;
		}

		if (dy - sy > 0) {
			sy = sy + 1;
		} else {
			sy = sy - 1;
		}

		if (sx !== dx || sy !== dy) requestAnimationFrame(manMoves);
	}

	// sx: source x, sy: source y; dx: destination x, dy: destination y
	function animate() {
		// var img = new Image();
		// width: 1029, height: 51, 21 mans
		// 49px width/man
		img.src = '/static/imgs/pegman.png';
		img.onload = function () {
			var dir = "right";

			if (currentPos.dir === "up") {
				dir = "up";
			} else if (currentPos.dir == "right") {
				dir = "right";
			} else if (currentPos.dir == "down") {
				dir = "down";
			} else if (currentPos.dir == "left") {
				dir = "left";
			}
		
			// console.log('man direction:'+dir);
 			currentDir = directions[dir]; // record current direction.
			imgX = manDirections[dir].x;
			imgY = manDirections[dir].y;
			// console.log(options.offset.x + " " + options.offset.y);
			dx = options.offset.x + currentPos.x * options.scale,
			dy = options.offset.y + currentPos.y * options.scale,
			sx = options.offset.x + oldPos.x * options.scale,
			sy = options.offset.y + oldPos.y * options.scale;
			manMoves();
		};
	}
	
	function drawMaze() {
		circle(maze.end.x, maze.end.y, options.colors.finish);
		for (y = 0; y < maze.height; y++) {
			for (x = 0; x < maze.width; x++) {
				drawCell(x, y);
			}
		}
	}
	
	function drawCell(x, y) {
		var curCell = maze.getCell(x, y);
		var originx = x * options.scale;
		var originy = y * options.scale;
		if (curCell.up && !maze.isStart(curCell.x, curCell.y)) line(originx, originy, originx + options.scale, originy);
		if (curCell.down && !maze.isEnd(curCell.x, curCell.y)) line(originx, originy + options.scale, originx + options.scale, originy + options.scale);
		if (curCell.right) line(originx + options.scale, originy, originx + options.scale, originy + options.scale);
		if (curCell.left) line(originx, originy, originx, originy + options.scale);
	}
	
	function line(x1, y1, x2, y2) {
		ctx.beginPath();
		ctx.strokeStyle = options.colors.walls;
		ctx.lineWidth = 2;
		ctx.moveTo(options.offset.x + x1 + 1, options.offset.y + y1 + 1);
		ctx.lineTo(options.offset.x + x2 + 1, options.offset.y + y2 + 1);
		ctx.stroke();
	}

	function circle(x, y, color) {
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(options.offset.x + (x + 0.5) * options.scale, options.offset.y + (y + 0.5) * options.scale, options.user_diameter, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	}
	
	this.getSteps = function() {
		// subtract one to account for the current positon being part of the path
		return path.length - 1;
	}
}
