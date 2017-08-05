

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
