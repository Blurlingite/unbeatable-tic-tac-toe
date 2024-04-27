//Initalize the Board
var origBoard;
//Variables
const huPlayer = 'O';
const aiPlayer = 'X';
//Array of Winning Combos from Left to Right
const winCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[6, 4, 2]
]
//Stores a Reference to the Cells
const cells = document.querySelectorAll('.cell');
//Function to start the game, runs at the start and when replay is clicked
startGame();


function selectSym(sym){
    huPlayer = sym;
    aiPlayer = sym==='O' ? 'X' :'O';
    origBoard = Array.from(Array(9).keys());
    for (let i = 0; i < cells.length; i++) {
      cells[i].addEventListener('click', turnClick, false);
    }
    if (aiPlayer === 'X') {
      turn(bestSpot(),aiPlayer);
    }
    document.querySelector('.selectSym').style.display = "none";
  }



function startGame() {
//Whenever button is clicked or initalized it is setting values
	document.querySelector(".endgame").style.display = "none";
    document.querySelector('.endgame .text').innerText ="";
    document.querySelector('.selectSym').style.display = "block";
    origBoard = Array.from(Array(9).keys());
    //Clears the board
    for (let i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
	}
}
//Logs the Place an entity clicks
function turnClick(square) {
	if (typeof origBoard[square.target.id] ==='number') {
        turn(square.target.id, huPlayer);
        //After user takes a turn, AI takes turn for best spot
        if (!checkWin(origBoard, huPlayer) && !checkTie())  
          turn(bestSpot(), aiPlayer);
      }
}
//Updates the place clicked on the board with the variable we set for Player
function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerHTML = player;
    let gameWon = checkWin(origBoard, player);
    //Runs gamewon function Then Gameover, Finds who won then runs commands at end of game
    if (gameWon) gameOver(gameWon);
    checkTie();
  }
  //See if we win
  function checkWin(board, player) {
    //Finds all places on board that has been played in
    //Reduces all elements to find the places where nothing is played in
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    //Time to Check if game is won, 
    for (let [index, win] of winCombos.entries()) {
        //Goes through every Element in array for wincondition
      if (win.every(elem => plays.indexOf(elem) > -1)) {
        gameWon = {index: index, player: player};
        break;
      }
    }
    return gameWon;
  }
  //
  function gameOver(gameWon){
    //Highlights boxes where entity won, background color depends on who won
    for (let index of winCombos[gameWon.index]) {
      document.getElementById(index).style.backgroundColor = 
        gameWon.player === huPlayer ? "blue" : "red";
    }
    //Makes it so that you cant Click anymore on the board and just displays win or lose
    for (let i=0; i < cells.length; i++) {
      cells[i].removeEventListener('click', turnClick, false);
    }
    declareWinner(gameWon.player === huPlayer ? "You win!" : "You lose");
  }
  //Winner
  function declareWinner(who) {
    //Displays Endgame
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
  }
  //Finds all empty Squares by filtering out every box with an element
  function emptySquares() {
    return origBoard.filter((elm, i) => i===elm);
  }
    //Finds best spot for Ai using minmax algor
  function bestSpot(){
    return minimax(origBoard, aiPlayer).index;
  }
    //Finds if its a Tie
  function checkTie() {
    if (emptySquares().length === 0){
      for (cell of cells) {
        //Removes the ability to click the board and change color to green
        cell.style.backgroundColor = "green";
        cell.removeEventListener('click',turnClick, false);
      }
      declareWinner("Tie game");
      return true;
    } 
    return false;
  }
  //MinMax Algorithm, makes it unbeatable
  function minimax(newBoard, player) {
    var availSpots = emptySquares(newBoard);
    // Sets values for win cases either player or AI
    if (checkWin(newBoard, huPlayer)) {
      return {score: -10};
    } else if (checkWin(newBoard, aiPlayer)) {
      return {score: 10};
    } else if (availSpots.length === 0) {
      return {score: 0};
    }
    //
    var moves = [];
    for (let i = 0; i < availSpots.length; i ++) {
      var move = {};
      move.index = newBoard[availSpots[i]];
      newBoard[availSpots[i]] = player;
      
      if (player === aiPlayer)
        move.score = minimax(newBoard, huPlayer).score;
      else
         move.score =  minimax(newBoard, aiPlayer).score;
      newBoard[availSpots[i]] = move.index;
      if ((player === aiPlayer && move.score === 10) || (player === huPlayer && move.score === -10))
        return move;
      else 
        moves.push(move);
    }
    
    let bestMove, bestScore;
    if (player === aiPlayer) {
      bestScore = -1000;
      for(let i = 0; i < moves.length; i++) {
        if (moves[i].score > bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    } else {
        bestScore = 1000;
        for(let i = 0; i < moves.length; i++) {
        if (moves[i].score < bestScore) {
          bestScore = moves[i].score;
          bestMove = i;
        }
      }
    }
    
    return moves[bestMove];
  }