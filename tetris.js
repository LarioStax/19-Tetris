let canvas = document.getElementById("gameWindow");
const ctx = canvas.getContext("2d");

//Number of rows
const ROWS = 20;
//Number of columns
const COLS = 10;
//One square is 20 x 20 pixels
const SQ = 25;
//White color symbols an empty square
const EMPTY = "white";

const scoreElement = document.getElementById("scoreNumber");
const levelElement = document.getElementById("levelNumber");
const tomoPicture = document.getElementById("tomo");
canvas.width = 10*SQ;
canvas.height = 20*SQ;

function drawSquare(x,y,color) {
	ctx.fillStyle = color;
	ctx.fillRect(x*SQ, y*SQ, SQ, SQ,);

	ctx.strokeStyle = "black";
	ctx.strokeRect(x*SQ, y*SQ, SQ, SQ);
}

let board = [];
for (r = 0; r < ROWS; r++) {
	board[r] = [];
	for (c = 0; c < COLS; c++) {
		board[r][c] = EMPTY;
	}
}

function drawBoard() {
	for (r = 0; r < ROWS; r++) {
		for (c = 0; c < COLS; c++) {
			drawSquare(c, r, board[r][c])
		}
	}
}

drawBoard();

//find another way for this!
// const Z = [
// 	[
// 		[1,1,0],
// 		[0,1,1],
// 		[0,0,0],

// 	],
// 	[
// 		[0,0,1],
// 		[0,1,1],
// 		[0,1,0]
// 	],
// 	[
// 		[0,0,0],
// 		[1,1,0],
// 		[0,1,1]
// 	],
// 	[
// 		[0,1,0],
// 		[1,1,0],
// 		[1,0,0]
// 	],
// ]

const SHAPES = [
	[Z, "red"],
	[S, "green"],
	[T, "teal"],
	[O, "blue"],
	[L, "purple"],
	[I, "cyan"],
	[J, "orange"],
];


function randomPiece() {
	let r = Math.floor(Math.random() * SHAPES.length); // returns 0 - 6
	return new Piece (SHAPES[r][0],SHAPES[r][1]);
}

//piece Constructor
function Piece(shape, color) {
	this.shape = shape;
	this.color = color;
	this.shapeNumber = 0; //index for pattern variations (used for rotations)
	this.activeShape = this.shape[this.shapeNumber];

	this.x = 4;
	this.y = -2;
}

Piece.prototype.move = function(color) {
	for (r = 0; r < this.activeShape.length;  r++) {
		for (c = 0; c < this.activeShape.length; c++) {
			//we recolour only the occupied spaces
			if (this.activeShape[r][c] === 1) {
				drawSquare(this.x + c, this.y + r, color);
			}
		}
	}
}

Piece.prototype.draw = function() {
	this.move(this.color);
}

Piece.prototype.delete = function() {

	this.move(EMPTY);
}

Piece.prototype.moveDown = function() {
	if(!this.collision(0, 1, this.activeShape)) {
		dropStart = Date.now();
		this.delete();
		this.y++;
		this.draw();
	} else {
		//lock the piece and generate a new one
		this.lock();
		p = randomPiece();
	}

}

Piece.prototype.moveRight = function() {
	if(!this.collision(1, 0, this.activeShape)) {
		this.delete();
		this.x++;
		this.draw();
	} else {

	}
}

Piece.prototype.moveLeft = function() {
	if(!this.collision(-1, 0, this.activeShape)) {
		this.delete();
		this.x--;
		this.draw();
	} else {

	}
}

Piece.prototype.rotate = function() {
	let nextShape = this.shape[(this.shapeNumber + 1) % this.shape.length];
	// console.log(nextShape);
	let wallKick = 0;

	if(this.collision(0,0,nextShape)) {
		if(this.x > COLS/2) {
			//it's the right wall
			wallKick = -1; // we need to move the piece to the left
		} else if (this.x < COLS/2) {
			//it's the right wall
			wallKick = 1; // we need to move the piece to the right
		}
		// console.log(wallKick);
	}

	if(!this.collision(wallKick, 0, nextShape)) {
		this.delete();
		// console.log(this.x);
		this.x += wallKick;
		// console.log(this.x);
		this.shapeNumber = (this.shapeNumber + 1) % this.shape.length;
		this.activeShape = this.shape[this.shapeNumber];
		this.draw();
	} else {

	}
}

Piece.prototype.collision = function(x,y,piece) {
	for (r = 0; r < piece.length;  r++) {
		for (c = 0; c < piece.length; c++) {
			//skip if the square is empty
			if(piece[r][c] === 0) {
				continue;
			}
			let newX = this.x + c + x;
			let newY = this.y + r + y;
			if(newX < 0 || newX >= COLS || newY >= ROWS) {
				return true;
			}
			//skip newY < 0; board[-1] will crash the game
			if(newY < 0) {
				continue;
			}
			//check if there is a locked piece already
			if (board[newY][newX] !== EMPTY) {
				return true;
			}
		}
	}
}

Piece.prototype.lock = function() {
	for (r = 0; r < this.activeShape.length;  r++) {
		for (c = 0; c < this.activeShape.length; c++) {
			//we skip the vacant squares
			if (this.activeShape[r][c] === 0) {
				continue;
			} 
			if(this.y + r < 0) {
				alert("Oh come on. You can do better than this! Try again!");
				//stop request animation frame
				gameOver = true;
				break;
			}
			board[this.y + r][this.x+c] = this.color;
		}
	}
	// remove full rows
	for(r = 0; r < ROWS; r++) {
		let isRowFull = true;
		for (c = 0; c < COLS; c++) {
			isRowFull = isRowFull && (board[r][c] != EMPTY);
		} 
		if(isRowFull) {
			//if true, move all rows down
			for (y = r; y > 1; y--) {
				for (c = 0; c < COLS; c++) {
					board[y][c] = board[y-1][c];
				}
			}
			for ( c = 0; c < COLS; c++) {
				board[0][c] = EMPTY;
			}
			score += 10;
			streak += 10;
		}
	}
	// update the board
	drawBoard();
	scoreElement.innerHTML = score;
	if (seeTomo) {
		tomoPicture.style.visibility = "hidden";
		seeTomo = false;
	}
}


document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
	if (event.keyCode == 37) {
		p.moveLeft();
	} else if (event.keyCode == 38) {
		p.rotate();
	} else if (event.keyCode == 39) {
		p.moveRight();
	} else if (event.keyCode == 40) {
		p.moveDown();
	}
}

let dropStart = Date.now();
let gameOver = false;
let score = 0;
let level = 1;
let streak = 0;
let delay = 1000;
let seeTomo = false;

function drop() {
	let now = Date.now();
	let delta = now - dropStart;
	let delayReducer = 0.90;
	console.log(delay);
	if (streak >= 30) {
		delay = Math.floor(delay * delayReducer);
		streak -= 30;
		level += 1;
		levelElement.innerHTML = level;
		tomoPicture.style.visibility = "visible";
		seeTomo = true;
	}
	if(delta > delay) {
		p.moveDown();
		dropStart = Date.now();
	} if (!gameOver) {
		requestAnimationFrame(drop);
	}
}

let p = randomPiece();
p.draw();
drop();

