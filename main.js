// vars
var playerIsX;
var isPlayerTurn;
var squares = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'];
var playerSquares = [];
var aiSquares = [];
var winConditions = [['tl', 'tc', 'tr'], ['ml', 'mc', 'mr'], ['bl', 'bc', 'br'], ['tl', 'ml', 'bl'], ['tc', 'mc', 'bc'], ['tr', 'mr', 'br'], ['tl', 'mc', 'br'], ['tr', 'mc', 'bl']];
var isGameOver = true;
function start() {
  playerIsX = undefined;
  isPlayerTurn = undefined;
  squares = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'];
  playerSquares = [];
  aiSquares = [];
  isGameOver = false;
  // set difficulty
  var isBeatable;
  if ($('#beatable').prop('checked')) {
    isBeatable = true;
  } else {
    isBeatable = false;
  }
  // determine start player
  if ($('#x').prop('checked')) {
    playerIsX = true;
  } else {
    playerIsX = false;
  }
  // begin game
  $(".start-btn").hide();
  clearBoard();
  // X goes first
  if (playerIsX) {
    isPlayerTurn = true;
    $('.start').html('You\'re turn <span></span>');
  } else {
    isPlayerTurn = false;
    $('.start').html('Computer\'s turn <span></span>');
    selectSquare();
  }
}
function clearBoard() {
  $('#tl, #tc, #tr, #ml, #mc, #mr, #bl, #bc, #br').html('');
}
function selectSquare(square) {
  // make board unclickable if it's not player's turn or game is over
  if (isPlayerTurn === undefined || isGameOver === true) {
    return;
  }
  // make sure square clicked is not already taken
  if (isPlayerTurn) {
    if (!squares.includes(square)) {
      $('.start').html('Square taken. Choose another. <span></span>');
      return;
    }
    if (playerIsX) {
      $('#' + square).html('<i class="fa fa-times" aria-hidden="true"></i>');
    } else {
      $('#' + square).html('<i class="fa fa-circle-o" aria-hidden="true"></i>');
    }
    playerSquares.push(square);
    checkForWin();
    if (isGameOver) {
      return;
    }
    squares = squares.filter(function (val) {
      return val !== square;
    });
    // check for draw
    if (squares.length < 1) {
      $('.start').html('<button class="start-btn" onclick="start();">Draw. -- start</button><span></span>');
      isGameOver = true;
      return;
    }
    isPlayerTurn = false;
    $('.start').html('Computer\'s turn <span></span>');
    setTimeout(function () {
      selectSquare();
    }, 1000);
  } else {
    let randomSquare = Math.floor(Math.random() * squares.length);
    if (!playerIsX) {
      $('#' + squares[randomSquare]).html('<i class="fa fa-times" aria-hidden="true"></i>');
    } else {
      $('#' + squares[randomSquare]).html('<i class="fa fa-circle-o" aria-hidden="true"></i>');
    }
    aiSquares.push(squares[randomSquare]);
    checkForWin();
    if (isGameOver) {
      return;
    }
    squares = squares.filter(function (val) {
      return val !== squares[randomSquare];
    });
    // check for draw
    if (squares.length < 1) {
      $('.start').html('<button class="start-btn" onclick="start();">Draw. -- start</button><span></span>');
      isGameOver = true;
      return;
    }
    isPlayerTurn = true;
    $('.start').html('You\'re turn <span></span>');
  }
}
function checkForWin() {
  if (isPlayerTurn) {
    for (let condition of winConditions) {
      let win = condition.every(function (val) {
        return playerSquares.indexOf(val) > -1;
      });
      if (win) {
        $('.start').html('<button class="start-btn" onclick="start();">You win! -- start</button><span></span>');
        isGameOver = true;
        break;
      }
    }
    return;
  } else {
    for (let condition of winConditions) {
      let win = condition.every(function (val) {
        return aiSquares.indexOf(val) > -1;
      });
      if (win) {
        $('.start').html('<button class="start-btn" onclick="start();">You lose. Try again. -- start</button><span></span>');
        isGameOver = true;
        break;
      }
    }
    return;
  }
}