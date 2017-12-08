// globals
var ai = "O";
var human = "X";
var board;
var isBeatable = true;
var isPlayerTurn = true;
var isGameOver = false;
const winConditions = [[0, 1, 2],
[3, 4, 5],
[6, 7, 8],
[0, 3, 6],
[1, 4, 7],
[2, 5, 8],
[0, 4, 8],
[6, 4, 2]
];
const startSound = {
  sound: new Howl({
    src: ['shall-we-play-a-game.mp3']
  })
};

$(document).ready(function () {
  startSound.sound.play();
})

function start() {
  // create new board
  board = Array.from(Array(9).keys());
  clearBoard();
  // set difficulty
  if ($('#beatable').prop('checked')) {
    isBeatable = true;
  } else {
    isBeatable = false;
  }
  // determine start player
  if ($('#x').prop('checked')) {
    ai = "O";
    human = "X";
  } else {
    ai = "X";
    human = "O";
  }
  // begin game
  $(".start-btn").hide();
  isGameOver = false;
  // X goes first
  if (ai === 'O') {
    playerTurn();
  } else {
    aiTurn();
  }
}

function clearBoard() {
  $('#0, #1, #2, #3, #4, #5, #6, #7, #8').html('');
  $('#board > div').css('background-color', "#1d2446");
}

function playerTurn() {
  $('.start').html('You\'re turn <span></span>');
}

function aiTurn() {
  // give the illusion of computer thinking with a timeout
  isPlayerTurn = false;
  $('.start').html('Computer\'s turn (thinking...) <span></span>');
  setTimeout(function () {
    if (isBeatable) {
      turn(pickRandomSquare(), ai);
      isPlayerTurn = true;
    } else {
      turn(bestSpot(), ai);
      isPlayerTurn = true;
    }
  }, 800);
}

function squareClick(square) {
  // make board unclickable if game is over or not player's turn
  if (isGameOver || !isPlayerTurn) {
    return;
  }
  if (typeof board[square] == 'number') {
    turn(square, human);
    if (!checkWin(board, human) && !checkTie()) {
      aiTurn();
    }
  }
}

function pickRandomSquare() {
  let openSqrs = emptySquares();
  return openSqrs[Math.floor(Math.random() * openSqrs.length)];
}

function emptySquares() {
  return board.filter(sqr => typeof sqr == 'number');
}

function turn(square, player) {
  board[square] = player;
  drawCircleOrX(square, player);
  let victory = checkWin(board, player);
  if (victory) {
    gameOver(victory);
  } else if (checkTie()) {
    $('.start').html('<button class="start-btn" onclick="start();">Draw. -- start</button><span></span>');
    $('#board > div').css('background-color', "purple");
  } else {
    if (!isPlayerTurn) {
      playerTurn();
    }
  }
}

function drawCircleOrX(square, player) {
  if (player === 'X') {
    $('#' + square).html('<i class="fa fa-times" aria-hidden="true"></i>');
  } else {
    $('#' + square).html('<i class="fa fa-circle-o" aria-hidden="true"></i>');
  }
}

function checkWin(board, player) {
  let moves = board.reduce((acc, cur, i) => cur === player ? acc.concat(i) : acc, []);
  let victory = null;
  for (let [index, condition] of winConditions.entries()) {
    if (condition.every(sqr => moves.indexOf(sqr) > -1)) {
      victory = { index: index, player: player };
      break;
    }
  }
  return victory;
}

function gameOver(victory) {
  for (let index of winConditions[victory.index]) {
    victory.player == human ? $('#' + index).css('background-color', "blue") : $('#' + index).css('background-color', "red");
  }
  declareWinner(victory.player);
  isGameOver = true;
}

function declareWinner(who) {
  if (who === human) {
    $('.start').html('<button class="start-btn" onclick="start();">You win! -- start</button><span></span>');
  } else {
    $('.start').html('<button class="start-btn" onclick="start();">You lose. Try again. -- start</button><span></span>');
  }
}

function checkTie() {
  if (emptySquares().length == 0) {
    return true;
  }
  return false;
}

function bestSpot() {
  return minimax(board, ai).index;
}

function minimax(futureBoard, player) {
  let openSqrs = emptySquares(futureBoard);
  if (checkWin(futureBoard, human)) {
    return { score: -10 };
  } else if (checkWin(futureBoard, ai)) {
    return { score: 10 };
  } else if (openSqrs.length === 0) {
    return { score: 0 };
  }
  let moves = [];
  for (let i = 0; i < openSqrs.length; i++) {
    let move = {};
    move.index = futureBoard[openSqrs[i]];
    futureBoard[openSqrs[i]] = player;
    if (player == ai) {
      let result = minimax(futureBoard, human);
      move.score = result.score;
    } else {
      let result = minimax(futureBoard, ai);
      move.score = result.score;
    }
    futureBoard[openSqrs[i]] = move.index;
    moves.push(move);
  }
  let bestMove;
  if (player === ai) {
    let bestScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}