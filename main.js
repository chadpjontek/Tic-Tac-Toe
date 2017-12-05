// vars
var playerIsX;
var isPlayerTurn;
var isBeatable = true;
var squares = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'];
var playerSquares = [];
var aiSquares = [];
var winConditions = [['tl', 'tc', 'tr'], ['ml', 'mc', 'mr'], ['bl', 'bc', 'br'], ['tl', 'ml', 'bl'], ['tc', 'mc', 'bc'], ['tr', 'mr', 'br'], ['tl', 'mc', 'br'], ['tr', 'mc', 'bl']];
var isGameOver = true;
var filteredCondition = [];
var winningSquare = "";
var winningSquareBlock = "";
var randomSquare = "";
var possibleBlocks = [];
var blockCount = {};
var maxBlocks = 0;
var bestBlock;
var startSound = {
  sound: new Howl({
    src: ['shall-we-play-a-game.mp3']
  })
};
$(document).ready(function () {
  startSound.sound.play();
})
function start() {
  playerIsX = undefined;
  isPlayerTurn = undefined;
  squares = ['tl', 'tc', 'tr', 'ml', 'mc', 'mr', 'bl', 'bc', 'br'];
  playerSquares = [];
  aiSquares = [];
  isGameOver = false;
  filteredCondition = [];
  winningSquare = "";
  winningSquareBlock = "";
  randomSquare = "";
  possibleBlocks = [];
  blockCount = {};
  maxBlocks = 0;
  bestBlock = "";
  // set difficulty
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
  if (isPlayerTurn) {
    // make sure square clicked is not already taken
    if (!squares.includes(square)) {
      return;
    }
    drawCircleOrX(square);
    playerSquares.push(square);
    checkForWin();
    if (isGameOver) {
      return;
    }
    squares = squares.filter(function (val) {
      return val !== square;
    });
    if (checkForDraw()) {
      return;
    }
    aiTurn();
  } else {
    // computer's turn
    if (isBeatable) {
      pickRandomSquare();
    } else {
      // unbeatable ai
      if (playerIsX && squares.length === 8) {
        var corners = ['tl', 'tr', 'bl', 'br'];
        var sides = ['tc', 'ml', 'mr', 'bc'];
        if (corners.indexOf(playerSquares[0]) > -1) {
          aiMoveProcess('mc');
          return;
        } else if (sides.indexOf(playerSquares[0]) > -1) {
          switch (playerSquares[0]) {
            case 'tc':
            case 'ml': aiMoveProcess('tl');
              break;
            case 'mr':
            case 'bc': aiMoveProcess('br');
              break;
          }
          return;
        } else {
          aiMoveProcess('tl');
          return;
        }
        return;
      }
      // Check each win condition and if win possible, pick that square.
      for (let condition of winConditions) {
        filteredCondition = condition.filter(square => aiSquares.indexOf(square) < 0);
        if (filteredCondition.length === 1) {
          if (playerSquares.indexOf(filteredCondition[0]) < 0) {
            winningSquare = squares[squares.indexOf(filteredCondition[0])];
            aiMoveProcess(winningSquare);
            break;
          }
        }
      }
      if (isGameOver) {
        return;
      }
      // Check each win condition for player and block
      for (let condition of winConditions) {
        filteredCondition = condition.filter(square => playerSquares.indexOf(square) < 0);
        if (filteredCondition.length === 1) {
          if (aiSquares.indexOf(filteredCondition[0]) < 0) {
            winningSquareBlock = squares[squares.indexOf(filteredCondition[0])];
            squares = squares.filter(val => val !== winningSquareBlock);
            aiMoveProcess(winningSquareBlock);
            break;
          }
        }
      }
      if (isPlayerTurn) {
        return;
      }
      // Pick square with highest block count
      possibleBlocks = [];
      blockCount = {};
      maxBlocks = 0;
      bestBlock = "";
      for (let condition of winConditions) {
        filteredCondition = condition.filter(square => playerSquares.indexOf(square) < 0);
        if (filteredCondition.length === 2) {
          possibleBlocks.push(filteredCondition);
        }
      }
      possibleBlocks = possibleBlocks.reduce((acc, cur) => acc.concat(cur),
        []
      );
      for (var v in possibleBlocks) {
        blockCount[possibleBlocks[v]] = (blockCount[possibleBlocks[v]] || 0) + 1;
        if (blockCount[possibleBlocks[v]] > maxBlocks) {
          maxBlocks = blockCount[possibleBlocks[v]];
          bestBlock = possibleBlocks[v];
        }
      }
      squares = squares.filter(val => val !== bestBlock);
      aiMoveProcess(bestBlock);
      if (isPlayerTurn) {
        return;
      }
      // Pick random square
      pickRandomSquare();
    }
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
function drawCircleOrX(square) {
  if ((playerIsX && isPlayerTurn) || (!playerIsX && !isPlayerTurn)) {
    // draw an X in square
    $('#' + square).html('<i class="fa fa-times" aria-hidden="true"></i>');
  } else {
    // draw an O in square
    $('#' + square).html('<i class="fa fa-circle-o" aria-hidden="true"></i>');
  }
}
function checkForDraw() {
  if (squares.length < 1) {
    $('.start').html('<button class="start-btn" onclick="start();">Draw. -- start</button><span></span>');
    isGameOver = true;
    return true;
  }
}
function playerTurn() {
  isPlayerTurn = true;
  $('.start').html('You\'re turn <span></span>');
}
function aiTurn() {
  isPlayerTurn = false;
  $('.start').html('Computer\'s turn <span></span>');
  setTimeout(function () {
    selectSquare();
  }, 800);
}
function pickRandomSquare() {
  randomSquare = squares[Math.floor(Math.random() * squares.length)];
  aiMoveProcess(randomSquare);
}
function aiMoveProcess(square) {
  drawCircleOrX(square);
  aiSquares.push(square);
  checkForWin();
  if (isGameOver) {
    return;
  }
  squares = squares.filter(function (val) {
    return val !== square;
  });
  if (checkForDraw()) {
    return;
  }
  playerTurn();
}