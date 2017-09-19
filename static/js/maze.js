function MazeGame(canvas, options) {
	var default_options = {
		colors: {
			walls: "#ee4646",
			current_position: "#67b9e8",
			finish: "#65c644",
			visited_block: "#d7edff",
			marks: "#434c63"
		},
		starting_position: { x: 0, y: 0, dir: "right"},
		level_size: [10, 10],
		offset: {x: 0, y: 0},
		scale: 54,
		user_diameter: 4,
		wall_width: 2,
		user_path_width: 4,
		screen_width: 960,
		onStart: function(){},
		onGameEnd: function(){},
		onMove: function(){}
	}
	
	// todo: don't use jQuery here
	options = $.extend({}, default_options, options);

	$(window).on('resize', center);
	
	var ctx, oldPos = options.starting_position, currentPos = options.starting_position, 
		startAngle = 0, maze, path, gameInProgress, marks, checkAngle = true;

	var allSituations = [
		{front: false, left: false, right: false},
		{front: false, left: false, right: true},
		{front: false, left: false, right: undefined},
		{front: false, left: true, right: false},
		{front: false, left: undefined, right: false},
		{front: false, left: true, right: true},
		{front: false, left: undefined, right: true},
		{front: false, left: true, right: undefined},
		{front: false, left: undefined, right: undefined},

		{front: true, left: false, right: false},
		{front: true, left: false, right: true},
		{front: true, left: false, right: undefined},
		{front: true, left: true, right: false},
		{front: true, left: undefined, right: false},
		{front: true, left: true, right: true},
		{front: true, left: undefined, right: true},
		{front: true, left: true, right: undefined},
		{front: true, left: undefined, right: undefined},

		{front: undefined, left: false, right: false},
		{front: undefined, left: false, right: true},
		{front: undefined, left: false, right: undefined},
		{front: undefined, left: true, right: false},
		{front: undefined, left: undefined, right: false},
		{front: undefined, left: true, right: true},
		{front: undefined, left: undefined, right: true},
		{front: undefined, left: true, right: undefined},
		{front: undefined, left: undefined, right: undefined}
	];

	function isRightSituation(element, index, arr) {
		if ((element.front === this.front) && (element.left === this.left) && (element.right === this.right)) {
			return index;
		}
	}

	this.indexOfSituations = function(obj) {
		return allSituations.findIndex(isRightSituation, obj);
	};

	var faceTos = {
		up: {up:"up", down: "down", left:"left", right:"right"}, //north
		down: {up:"down", down: "up", left:"right", right:"left"},//south
		left : {up:"left", down: "right", left:"down", right:"up"},//west
		right : {up:"right", down: "left", left:"up", right:"down"}//east
	};
	// recording action under all possible situations.
	// up down left right, 0: free, 1: wall
	// ["0000", "0001", "0010", "0011", 
	// 	"0100", "0101", "0110", "0111",
	// 	"1000", "1001", "1010", "1011",
	// 	"1100", "1101", "1110", "1111"];
	var solution = {
		name: '',
		situations: Array(16).fill(false),
		marks: Array(16).fill(false),
		actionsList: Array(16).fill('')
	};

	function initSolution() {
		solution = {
			name: '',
			situations: Array(16).fill(false),
			marks: Array(16).fill(false),
			actionsList: Array(16).fill('')
		};
	}

	this.resetSolution = function() {
		initSolution();
	};

	var offsets = {
		left	:	{ x: -1, y: 0 },
		up		:	{ x: 0, y:	-1 },
		right	:	{ x: 1, y: 0 },
		down	:	{ x: 0, y: 1 }
	};

	var img = new Image();

	// width: 1029, height: 51, 21 mans
	// 49px width/man
	var manWidth = 49, manHeight = 51;
	var manDirections = {
		up		: 	{x: 0, y: 0},
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

	var positionAngles = [], simulatePositionAngles = [];
	function initPostionAngles() {
		for (y = 0; y < options.level_size[1]; y++) {
			positionAngles.push(new Array());
			simulatePositionAngles.push(new Array());
			for (x = 0; x < options.level_size[0]; x++) {
				positionAngles[y].push({angle: undefined, visited: false});
				simulatePositionAngles[y].push({angle: undefined, visited: false});
			}
		}
	}

	var stopedStatus = [];
	function initStopedStatus() {
		for (y = 0; y < options.level_size[1]; y++) {
			stopedStatus.push(new Array());
			for (x = 0; x < options.level_size[0]; x++) {
				stopedStatus[y].push({up: false, down: false, left: false, right: false});
			}
		}
	}

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
	
	/* Generate the maze using recursive backtracking.
	 * Returns a 2D array of Cells
	 * https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker
	 */
	function Maze(width, height) {
		this.m = [];
		this.visited = [];
		this.marks = [];
		this.width = width; // size
		this.height = height;
		this.start = options.starting_position;
		this.end = {
			x: this.width - 1,
			y: this.height - 1
		};
		this.levelOption = options.levelOption;
		this.mazeLevel = 0;
		this.hasIsland = false;
		this.island;
		this.initMaze = function () {
			for (y = 0; y < height; y++) {
				this.m.push(new Array());
				this.visited.push(new Array());
				for (x = 0; x < width; x++) {
					this.m[y].push(new Cell(x, y));
					this.visited[y].push(0);
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
		this.randomCell = function() {
 			return this.getCell(rand.randomInt(this.width), rand.randomInt(this.height));
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
		/* Generate the maze using recursive backtracking
 		*  https://en.wikipedia.org/wiki/Maze_generation_algorithm#Recursive_backtracker
 		*/
		this.generateMaze = function () {
			var current_cell = this.randomCell();
 			var next_cell = null;
 			
 			current_cell.visited = true;
 			var visitedStack = [current_cell];
 			
 			while (visitedStack.length > 0) {
 				if (this.isDeadEnd(current_cell.x, current_cell.y)) {
 					current_cell = visitedStack.pop();
 				} else {
 					if (!this.isEdge(current_cell.x, current_cell.y) && !this.hasIsland) {
						this.island = current_cell;
						this.hasIsland = true;
					}
 					next_cell = this.randomNeighbor(current_cell.x, current_cell.y);
 					next_cell.visited = true;
 					this.breakWall(current_cell, next_cell);
 					visitedStack.push(current_cell);
 					current_cell = next_cell;
 				}
 			}

			if (this.levelOption === "random") {
				let r = Math.round(Math.random());
				if (r === 0) {
					this.mazeLevel = 0;
				} else if (r === 1){
					this.mazeLevel = 1;
				}
			} else if (this.levelOption === "one") {
				this.mazeLevel = 1;
			}

			if (this.mazeLevel === 1) {
				this.generateIsland();
			} 
		};

		this.generateIsland = function() {
			this.island.up = true;
			this.island.down = true;
			this.island.left = true;
			this.island.right = true;
			this.setEightNeighbors(this.island.x, this.island.y);
		};

		this.reset = function() {
			for (y = 0; y < height; y++) {
				for (x = 0; x < width; x++) {
					this.visited[x][y] = 0;
				}
			}
		};

		//Mark means cross
		this.isMark = function (x, y) {
			var cell = this.getCell(x, y), exits = 0;
			if (!cell.up) {
				exits += 1;
			}
			if (!cell.left) {
				exits += 1;
			}
			if (!cell.right) {
				exits += 1;
			}
			if (!cell.down) {
				exits += 1;
			}

			if (exits >= 3) {
				return true;
			} else {
				return false;
			}
		};
		this.getAllMarks = function() {
			this.marks = [];
			for (y = 0; y < height; y++) {
				for (x = 0; x < width; x++) {
					if (this.isMark(x, y)) {
						this.marks.push(this.m[y][x]);
					}
				}
			}
			return this.marks;
		};
		this.initMaze();
		this.generateMaze();
	}
	
	function setup(height, width) {
		//convert string number to arithmetic number
		width = parseInt(width);
		height = parseInt(height);
		maze = new Maze(height, width);
		initPostionAngles();
		initStopedStatus();
		var screenWidth = $(window).width();
		options.scale = Math.floor((screenWidth * 0.5 - (options.wall_width * (width + 1))) / width);
		currentPos = Object.assign({}, options.starting_position);
		marks = [];	//save Marker
		path = [];
		path.push(currentPos);

		// choosing a direction to which the tiny man faces.
		let currentCell = maze.getCell(0, 0);
		if (currentCell.right === false) {
			currentPos.dir = "right";
		} else if (currentCell.down === false) {
			currentPos.dir = "down";
		} else {
			console.log("The maze not produced incorrectly.")
		}

		// init pegman
		img.src = '/static/imgs/pegman.png';
		img.onload = function () {
			var dir = "right";

			if (currentPos.dir == "up") {
				dir = "up";
			} else if (currentPos.dir == "right") {
				dir = "right";
			} else if (currentPos.dir == "down") {
				dir = "down";
			} else if (currentPos.dir == "left") {
				dir = "left";
			}
		
			var imgX = manDirections[dir].x;
			var imgY = manDirections[dir].y;
			var dx = options.offset.x + currentPos.x * options.scale + options.wall_width,
			dy = options.offset.y + currentPos.y * options.scale + options.wall_width;
			ctx.drawImage(img, imgX, imgY, 49, 51, dx, dy, options.scale - options.wall_width, options.scale - options.wall_width);
		};

		center();

		// update the direction we faced to at start position.
		options.starting_position.dir = currentPos.dir;
		// record position
		oldPos = currentPos;
	}

	function reInit() {
		// console.log(options.starting_position.x + ' ' + options.starting_position.y);
		currentPos = Object.assign({}, options.starting_position);
		path = [];
		path.push(currentPos);

		// reset angle
		startAngle = 0;

		// record position
		oldPos = currentPos;
	}

	function center() {
		var screenWidth = $(window).width();
		options.scale = Math.floor((screenWidth * 0.5 - (options.wall_width * (maze.width + 1))) / maze.width);
		canvas.width = maze.width * options.scale + 3;
		canvas.height = maze.height * options.scale + 3;
		// canvas.width = $('body').width();
		// canvas.height = $('body').height();
		// options.offset.x = Math.floor((canvas.width / 2) - (maze.width * options.scale / 2));
		// options.offset.y = Math.floor((canvas.height / 2) - (maze.height * options.scale / 2));
		// $("#a").width(maze.width * options.scale + 3).css('padding-top', (canvas.height / 2) - (maze.height * options.scale / 2) - $('h1').height());
		// $("#time, #steps").css('margin-top', maze.height * options.scale);
		
		// draw();
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		drawPath();
		drawMan();
		drawMaze();
	}
	
	function start() {
		gameInProgress = true;
		options.onStart();
	}
	
	function draw() {
		// ctx.clearRect(0, 0, canvas.width, canvas.height);
		animate();
		// drawPath();
		// drawMaze();
	}

	function drawWithoutWall() {
		animate();
	}

	function getVisited() {
		return maze.visited;
	}

	function isVisitedMark(pos) {
		for (let p of visitedCrossPostions) {
			if ((pos.x === p.x) && (pos.y === p.y) && (pos.dir === p.dir)) {
				return true;
			}
		}	

		return false;	
	}

	function isJunction(pos) {
		// console.log("isCrossPos" + pos.dir + faceTos);
		let cell = maze.getCell(pos.x, pos.y),
			f = faceTos[pos.dir],
			exits = 0;
		if (!cell[f.up]) {
			exits += 1;
		}
		if (!cell[f.left] || !cell[f.right]) {
			exits += 1;
		}

		if (exits >= 2) {
			// console.log("cross pos: true")
			return true;
		} else {
			// console.log("cross pos: false")
			return false;
		}
	}

	var joker = {
		up: false,
		left: false,
		right: false
	};
	this.setJoker = function(dir, value) {
		if (dir === "up") {
			joker.up = value;
		} else if (dir === "left") {
			joker.left = value;
		} else if (dir === "right") {
			joker.right = value;
		}
	};

	function resetJoker() {
		joker = {
			up: false,
			left: false,
			right: false
		};
	}

	this.solutionToJson = function(name) {
		if (!name) {
			return null;
		}
		solution.name = name;
		var jsonData = JSON.stringify(solution);
		return jsonData;
	};

	this.updateSolutionObj = function(s) {
		initSolution(); 
		if (s) {
			solution.name = s.name;
			var rules = JSON.parse(s.rules);
			for (var i = 0; i < rules.length; i++) {
				var si = {
					up: rules[i].front_side,
					left: rules[i].left_side,
					right: rules[i].right_side
				};
				var index = this.getShortSituation(si);
				solution.situations[index] = true;
				solution.marks[index] = rules[i].mark;
				solution.actionsList[index] = rules[i].actions;
			}
			return solution;
		} else {
			return undefined;
		}
	}

	this.getSolution = function() {
		return solution;
	};

	this.getSizeofMaze = function() {
		return {width: maze.width, height: maze.height};
	};

	this.getCurrentPos = function() {
		return currentPos;
	};

	this.getCurrentStatus = function() {
		return {
			faceTo: currentPos.dir,
			x: currentPos.x,
			y: currentPos.y
		};
	};

	this.placeMark = function() {
		var index = this.getShortSituation();
		solution.marks[index] = true;
		marks.push(currentPos);
	};

	this.removeMark = function() {
		var index = this.getShortSituation();
		solution.marks[index] = false;
		marks.pop(currentPos);
	};

	function curPosInMarks() {
		for (var i = 0; i < marks.length; i++) {
			if (marks[i].x === currentPos.x && marks[i].y === currentPos.y) {
				return true;
			} else {
				return false;
			}
		}
	}

	this.markPlaced = function() {
		for (var i = 0; i < marks.length; i++) {
			if (marks[i].x === currentPos.x && marks[i].y === currentPos.y) {
				return true;
			} else {
				return false;
			}
		}
	};

	// this.storeActions = function(actions) {
	// 	let i = this.getShortSituation();
	// 	solution.actionsList[i] = actions;
	// 	// console.log('[storeActions]' + i + ' ' + solution.actionsList[i]);

	// }

	var ruleRecord = [], ruleNo = 0;
	this.nextRuleNo = function() {
		return ruleNo++;
	};

	this.setSituation = function(b, actions) {
		let index = this.getShortSituation(), s = this.getSituation();
		
		// 0, 1, 2, 3, 8, 9, 10, 11
		let res = [], situNums = [0b0000, 0b0001, 0b0010, 0b0011, 0b1000, 0b1001, 0b1010, 0b1011];
		if (!joker.up) {
			if (s.up == true) {
				res.push({bit: 3, val: 1});
			} else {
				res.push({bit: 3, val: 0});
			}
		}

		if (!joker.left) {
			if (s.left == true) {
				res.push({bit: 1, val: 1});
			} else {
				res.push({bit: 1, val: 0});
			}
		}

		if (!joker.right) {
			if (s.right == true) {
				res.push({bit: 0, val: 1});
			} else {
				res.push({bit: 0, val: 0});
			}
		}
		ruleRecord.push(new Array());
		for (var i = 0; i < situNums.length; i++) {
			for (var j = 0; j < res.length; j++) {
				if (((situNums[i] >> res[j].bit) & 0x1) !== res[j].val) {
					break;
				}

				if (j === (res.length - 1)) {
					solution.situations[situNums[i]] = b;
					solution.actionsList[situNums[i]] = actions;
					ruleRecord[ruleNo].push(situNums[i]);
				}
			}
		}

		resetJoker();
	}

	this.removeRule = function(i) {
		// let situs = ruleRecord[i];

		// for (var i = 0; i < situs.length; i++) {
		// 	solution.situations[situs[i]] = false;
		// 	solution.actionsList[situs[i]] = "";
		// }

		let situs = allSituations[i];

		if (!situs) {
			return ;
		}

		let res = [], situNums = [0b0000, 0b0001, 0b0010, 0b0011, 0b1000, 0b1001, 0b1010, 0b1011];
		if (!joker.up) {
			if (situs.front == true) {
				res.push({bit: 3, val: 1});
			} else {
				res.push({bit: 3, val: 0});
			}
		}

		if (!joker.left) {
			if (situs.left == true) {
				res.push({bit: 1, val: 1});
			} else {
				res.push({bit: 1, val: 0});
			}
		}

		if (!joker.right) {
			if (situs.right == true) {
				res.push({bit: 0, val: 1});
			} else {
				res.push({bit: 0, val: 0});
			}
		}
		for (var i = 0; i < situNums.length; i++) {
			for (var j = 0; j < res.length; j++) {
				if (((situNums[i] >> res[j].bit) & 0x1) !== res[j].val) {
					break;
				}

				if (j === (res.length - 1)) {
					solution.situations[situNums[i]] = false;
					solution.actionsList[situNums[i]] = "";
				}
			}
		}
		resetJoker();
	};

	this.isSituationExisted = function() {
		stopedStatus[oldPos.x][oldPos.y][oldPos.dir] = true;
		initMsgType();

		let i = this.getShortSituation();
		// console.log("situation:" + i + " " + solution.situations[i]);
		if (solution.situations[i] === true) {
			// console.log(currentPos);
			// console.log(stopedStatus[currentPos.x][currentPos.y][currentPos.dir]);
			if (stopedStatus[currentPos.x][currentPos.y][currentPos.dir] === true) {
				setMsgType('CIRCLE');
				return false;
			} else {
				stopedStatus[currentPos.x][currentPos.y][currentPos.dir] = true;
				return true;
			}
		} else {
			stopedStatus[currentPos.x][currentPos.y][currentPos.dir] = true;
			return false;
		}
	};

	this.getActionsOfSituation = function() {
		let i = this.getShortSituation();
		// console.log("action of situation:" + i + "##" + solution.actionsList[i])
		return solution.actionsList[i];
	};

	this.shortSituationToObj = function(i) {
		var s = {
			up: true,
			left: true,
			right: true
		}
		if (solution.situations[i] === true) {
			if (((i >> 3) & 0x01) == 0) {

				s.up = false;
			}
			if (((i >> 1) & 0x01) == 0) {
				s.left = false;
			}
			if ((i & 0x01) == 0) {
				s.right = false;
			}
		}
		return s;
	};

	this.getSituation = function() {
		let cell = maze.getCell(currentPos.x, currentPos.y),
			faceTo = faceTos[currentPos.dir];

		var res = {
			up: cell[faceTo["up"]],
			down: cell[faceTo["down"]],
			left: cell[faceTo["left"]],
			right: cell[faceTo["right"]],
			mark:  curPosInMarks()
		};
		return res;
	};

	this.getShortSituation = function(tmp) {
		let s = tmp || this.getSituation(),
			shortSituation = 0x0;

		if (s.up == true) {
			 shortSituation += 1 << 3;
		} 

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
			up: cell[faceTo["up"]] === true? "Belgt":"Frei",
			left: cell[faceTo["left"]] === true? "Belegt":"Frei",
			right: cell[faceTo["right"]] === true? "Belegt":"Frei"
		};
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

	var turnDir = "up";
	this.getForwardDir = function (turnTo) {
		// simulateUpdateAngle(turnTo);
		turnDir = turnTo;
		let f = faceTos[currentPos.dir];
		return f[turnTo];
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
					return true;
				}
				if (oldCell[oldFaceTo["down"]] !== newCell[newFaceTo["down"]]) {
					return true;
				}
				if (oldCell[oldFaceTo["left"]] !== newCell[newFaceTo["left"]]) {
					return true;
				}
				if (oldCell[oldFaceTo["right"]] !== newCell[newFaceTo["right"]]) {
					return true;
				}

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

	this.getAngle = function() {
		return startAngle;
	};

	function resetAngle() {
		startAngle = 0;
	}

	function updateAngle(direction) {
		if (direction === "left" || direction === "right") {
			startAngle = startAngle + rotatedAngle[direction];
		}
	}

	// function simulateUpdateAngle(direction) {
	// 	if (direction === "left" || direction === "right") {
	// 		simulateAngle = simulateAngle + rotatedAngle[direction];
	// 	}
	// }

	// back to same position and turn 360 grade.
	// function turnCircle(pos) {
	// 	// console.log('normal:' + pos.x + ' ' + pos.y + ' ' + positionAngles[pos.x][pos.y].visited);
	// 	if (!positionAngles[pos.x][pos.y].visited) {
	// 		return false;
	// 	}
	// 	if (!positionAngles[pos.x][pos.y].angle) {
	// 		console.log('nomal, impossible.');
	// 	}

	// 	var angle = startAngle - positionAngles[pos.x][pos.y].angle;
	// 	// console.log('normal: ' + startAngle + ',curpos Angle:' + positionAngles[pos.x][pos.y].angle);
	// 	if ((angle % 360 === 0) && (angle !== 0)) {
	// 		console.log('turn a circle at ame position.');
	// 		return true;
	// 	} else {
	// 		return false;
	// 	}
		
	// }

	// function simulateTurnCircle(pos) {
	// 	// console.log('simulate:' + pos.x + ' ' + pos.y);
	// 	// console.log(simulatePositionAngles[pos.x][pos.y]);
	// 	if (!simulatePositionAngles[pos.x][pos.y].visited) {
	// 		return false;
	// 	}
	// 	if (!simulatePositionAngles[pos.x][pos.y].angle) {
	// 		console.log('impossible.');
	// 	}

	// 	var angle = simulateAngle - simulatePositionAngles[pos.x][pos.y].angle;
	// 	console.log( positionAngles[pos.x][pos.y] + ' ' + angle);
	// 	// console.log('simulate angle:' + simulateAngle + ',curpos Angle:' + positionAngles[pos.x][pos.y].angle);

	// 	if ((angle % 360 === 0) && (angle !== 0)) {
	// 		// simulateAngle %= 360;
	// 		console.log('simulate: turn a circle at ame position.');
	// 		return true;
	// 	} else {
	// 		return false;
	// 	}
	// }

	this.setCheckAngle = function(flag) {
		checkAngle = flag;
	};

	this.foundExit = function() {
		if (maze.isEnd(currentPos.x, currentPos.y)) {
			return true;
		} else {
			return false;
		}
	};

	var msgType = {
		WALL: false,
		MARK: false,
		CIRCLE: false,
		END: false
	};

	this.getMsgType = function() {
		return msgType;
	};

	function initMsgType() {
		for (var p in msgType) {
			msgType[p] = false;
		}
	}

	function setMsgType(type) {
		for (var p in msgType) {
			msgType[p] = false;
		}
		msgType[type] = true;
	}

	var simulateCurPos;
	this.saveCurPos = function() {
		simulateCurPos = Object.assign({}, currentPos);
	};

	this.restoreCurPos = function() {
		currentPos = Object.assign({}, simulateCurPos);
	};

	this.simulateMove = function(direction, inAlgo=false) {
		var newPos = {
			x: currentPos.x + offsets[direction].x,
			y: currentPos.y + offsets[direction].y,
			dir: direction
		};
		if (gameInProgress) {
			if (currentPos.dir === direction) {
				if (maze.getCell(currentPos.x, currentPos.y)[direction] === false) {
					currentPos = newPos;
					if (maze.isEnd(newPos.x, newPos.y)) {
						return false;
					}

					if (curPosInMarks(newPos)) {
						return false;
					}
				} else {

					return false;
				}
			} else {
				currentPos.dir = direction;
				if (maze.isEnd(currentPos.x, currentPos.y)) {
					return false;
				}

				if (curPosInMarks(currentPos)) {
					return false;
				}		
			}
			return true;
		}
	}


	this.move = function(direction, inAlgo=false) {
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
			if (inAlgo) {
				initMsgType();
			}
			if (currentPos.dir === direction) {
				if (maze.getCell(currentPos.x, currentPos.y)[direction] === false) {
					path.push(newPos);
					currentPos = newPos;
					draw();
					// showSteps();

					if (maze.isEnd(newPos.x, newPos.y)) {
						options.onGameEnd(true);
						setMsgType('END');
						return false;
					}

					if (curPosInMarks(currentPos)) {
						setMsgType('MARK');
						console.log('visited mark');
						return false;
					}

					startAngle = startAngle % 360;
				
				} else {
					setMsgType('WALL');
					console.log("meet a wall.");
					return false;
				}
			} else {
				updateAngle(turnDir);
				currentPos.dir = direction;
				// console.log('adjust direction from ' + oldPos.dir + ' to ' + currentPos.dir + ' at the same postion.');
				draw();
				// showSteps();
				if (maze.isEnd(currentPos.x, currentPos.y)) {
					options.onGameEnd(true);
					setMsgType('END');
					return false;
				}

				if (curPosInMarks(currentPos)) {
					setMsgType('MARK');
					console.log('visited mark');
					return false;
				}
			}

			positionAngles[oldPos.x][oldPos.y].visited = true;
			
			return true;
		}
	};

	this.moveInTremaux = function(direction, backtrack=false) {
		oldPos = Object.assign({}, currentPos);
		// console.log('[move] oldPos:' + oldPos.dir + ' new dir:' + direction);
		// currentPos: old postion we needed, newPos is calculated new position namely current position.
		var newPos = {
			x: currentPos.x + offsets[direction].x,
			y: currentPos.y + offsets[direction].y,
			dir: direction
		};
		if (gameInProgress && maze.inBounds(newPos.x, newPos.y)) {
			if (backtrack || maze.visited[newPos.y][newPos.x] == 0) {
				if (maze.getCell(currentPos.x, currentPos.y)[direction] === false 
					&& maze.visited[newPos.y][newPos.x] < 2) {
					path.push(newPos);
					currentPos = newPos;

					ctx.strokeStyle = backtrack ? "#d7edff":"#4286f4";
					ctx.beginPath();
					ctx.moveTo(options.offset.x + (oldPos.x + 0.5) * options.scale,  options.offset.y + (oldPos.y + 0.5) * options.scale);
					ctx.lineTo(options.offset.x + (currentPos.x + 0.5) * options.scale, options.offset.y + (currentPos.y + 0.5) * options.scale);
					ctx.stroke();

					// showSteps();
					if (maze.isEnd(newPos.x, newPos.y)) {
						options.onGameEnd(true);
					}

					// times of visiting a cell
					maze.visited[currentPos.y][currentPos.x]++;

					if (backtrack) {
						maze.visited[oldPos.y][oldPos.x] = 2;
					}

					if (maze.visited[oldPos.y][oldPos.x] == 2 && maze.visited[currentPos.y][currentPos.x] == 1) {
						// Found an unwalked tile while backtracking. Mark our last tile back to 1 so we can visit it again to exit this path.
						maze.visited[oldPos.y][oldPos.x] = 1;
						ctx.strokeStyle = "#4286f4";
						ctx.beginPath();
						ctx.moveTo(options.offset.x + (currentPos.x + 0.5) * options.scale,  options.offset.y + (currentPos.y + 0.5) * options.scale);
						ctx.lineTo(options.offset.x + (oldPos.x + 0.5) * options.scale, options.offset.y + (oldPos.y + 0.5) * options.scale);
						ctx.stroke();
					}
					return true;
				} else {
					return false;
				}
			} else {
				console.log("not backtrack and is visited.");
				return false;
			}
		} else {
			return false;
		}
	};

	function manMoves(sx, sy, dx, dy, imgX, imgY) {
		//line width: 2
		ctx.clearRect(sx, sy, options.scale - options.wall_width, options.scale - options.wall_width);
		// console.log("manMoves" + sx + ":" + sy + "," + dx + ":" + dy);

		clearMarks();
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

		//draw marks
		drawMarks();
	
		ctx.drawImage(img, imgX, imgY, 49, 51, dx, dy, options.scale - options.wall_width, options.scale - options.wall_width);
	}

	// sx: source x, sy: source y; dx: destination x, dy: destination y
	// var sx, sy, dx, dy, imgX, imgY;
	function animate() {
		// var img = new Image();
		// width: 1029, height: 51, 21 mans
		// 49px width/man
		var cPos = Object.assign({}, currentPos), oPos = Object.assign({}, oldPos);
		// img.onload = function () {
			var dir = "right";

			if (cPos.dir == "up") {
				dir = "up";
			} else if (cPos.dir == "right") {
				dir = "right";
			} else if (cPos.dir == "down") {
				dir = "down";
			} else if (cPos.dir == "left") {
				dir = "left";
			}
		
			// console.log('man direction:'+dir);
			var imgX = manDirections[dir].x,
				imgY = manDirections[dir].y;
			var dx = options.offset.x + cPos.x * options.scale + options.wall_width,
			dy = options.offset.y + cPos.y * options.scale + options.wall_width,
			sx = options.offset.x + oPos.x * options.scale + options.wall_width,
			sy = options.offset.y + oPos.y * options.scale + options.wall_width;
			manMoves(sx, sy, dx, dy, imgX, imgY);
			// manMoves();
		// }; 
	}

	function drawMan() {
		var cPos = Object.assign({}, currentPos);
		// img.src = '/static/imgs/pegman.png';
		// img.onload = function () {
			var dir = "right";

			if (cPos.dir == "up") {
				dir = "up";
			} else if (cPos.dir == "right") {
				dir = "right";
			} else if (cPos.dir == "down") {
				dir = "down";
			} else if (cPos.dir == "left") {
				dir = "left";
			}
		
			var imgX = manDirections[dir].x;
			var imgY = manDirections[dir].y;
			var dx = options.offset.x + cPos.x * options.scale + options.wall_width,
			dy = options.offset.y + cPos.y * options.scale + options.wall_width;
			ctx.drawImage(img, imgX, imgY, 49, 51, dx, dy, options.scale - options.wall_width, options.scale - options.wall_width);
		// };
	}
	
	function drawPath() {
		ctx.lineWidth = options.user_path_width;
		ctx.strokeStyle = options.colors.visited_block;
		ctx.beginPath();
		ctx.moveTo(options.offset.x + 0.5 * options.scale, 0);
		for (i = 0; i < path.length - 1; i++) {
			ctx.lineTo(options.offset.x + (path[i].x + 0.5) * options.scale, options.offset.y + (path[i].y + 0.5) * options.scale);
		}
		ctx.lineTo(options.offset.x + (currentPos.x + 0.5) * options.scale, options.offset.y + (currentPos.y + 0.5) * options.scale);
		ctx.stroke();
		// circle(currentPos.x, currentPos.y, options.colors.current_position);
	}

	function clearMarks() {
		if (marks) {
			for (var i = 0; i < marks.length; i++) {
				ctx.clearRect(
					options.offset.x + marks[i].x * options.scale + options.wall_width, 
					options.offset.y + marks[i].y * options.scale + options.wall_width,
					options.scale - options.wall_width, options.scale - options.wall_width);
			}
		}
	}

	function drawMarks() {
		if (marks) {
			for (var i = 0; i < marks.length; i++) {
				circle(marks[i].x, marks[i].y, options.colors.marks);
			}
		} else {
			console.log('generate maze first.')
		}
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
		ctx.lineWidth = options.wall_width;
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
	};

	this.reset = function() {
		if (maze === undefined) {
			console.log('maze object is undefined. To regenerate a new maze.')
		} 

		maze.reset();

		var screenWidth = $(window).width();
		options.scale = Math.floor((screenWidth * 0.5 - (options.wall_width * (maze.width + 1))) / maze.width);
		currentPos = Object.assign({}, options.starting_position);
		path = [];
		path.push(currentPos);
		marks = [];
		initPostionAngles();
		initStopedStatus();
		initMsgType();
		startAngle = 0;

		center();

		// choosing a direction to which the tiny man faces.
		let currentCell = maze.getCell(0, 0);
		if (currentCell.right === false) {
			currentPos.dir = "right";
		} else if (currentCell.down === false) {
			currentPos.dir = "down";
		} else {
			console.log("The maze not produced incorrectly.")
		}
	};
}
