//Initalize the Board
var Board;

//Array of Winning Combos from Left to Right
const WinningCombos = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[6, 4, 2]
]
//Stores a Reference to the Boxes
const Boxes = document.querySelectorAll('.cell');
//Function to start the game, runs at the start and when replay is clicked
startGame();

//Function for selecting variable
function SelectionPrompt(SystemSelect){
    huPlayer = SystemSelect;
    aiPlayer = SystemSelect==='O' ? 'X' :'O';
    Board = Array.from(Array(9).keys());
    for (let i = 0; i < Boxes.length; i++) {
      Boxes[i].addEventListener('click', TurnBehavior, false);
    }
    if (aiPlayer === 'X') {
      TurnUpdate(bestSpot(),aiPlayer);
    }
    document.querySelector('.SelectionPrompt').style.display = "none";
  }



function startGame() {
//Whenever button is clicked or initalized it is setting values
    document.querySelector(".endgame").style.display = "none";
    document.querySelector('.endgame .text').innerText ="";
    document.querySelector('.SelectionPrompt').style.display = "block";
    Board = Array.from(Array(9).keys());
    //Clears the board
    for (let i = 0; i < Boxes.length; i++) {
        Boxes[i].innerText = '';
        Boxes[i].style.removeProperty('background-color');
	}
}
//Logs the Place an entity clicks
function TurnBehavior(square) {
	if (typeof Board[square.target.id] ==='number') {
        TurnUpdate(square.target.id, huPlayer);
        //After user takes a TurnUpdate, AI takes TurnUpdate for best spot
        if (!CheckWinCondition(Board, huPlayer) && !CheckTieCondition())  
          TurnUpdate(bestSpot(), aiPlayer);
      }
}
//Updates the place clicked on the board with the variable we set for Player
function TurnUpdate(squareId, player) {
    Board[squareId] = player;
    document.getElementById(squareId).innerHTML = player;
    let GameWinCondition = CheckWinCondition(Board, player);
    //Runs gamewon function Then Gameover, Finds who won then runs commands at end of game
    if (GameWinCondition) GameOverCondition(GameWinCondition);
    CheckTieCondition();
  }
  //See if we win
  function CheckWinCondition(board, player) {
    //Finds all places on board that has been played in
    //Reduces all elements to find the places where nothing is played in
    let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
    let GameWinCondition = null;
    //Time to Check if game is won, 
    for (let [index, win] of WinningCombos.entries()) {
        //Goes through every Element in array for wincondition
      if (win.every(elem => plays.indexOf(elem) > -1)) {
        GameWinCondition = {index: index, player: player};
        break;
      }
    }
    return GameWinCondition;
  }
  //Runs Commands from GameOverCondition after calling GameWon, Ending Displays and Functions of the program, Essentially what happens when game is over
  function GameOverCondition(GameWinCondition){
    //Highlights boxes where entity won, background color depends on who won
    for (let index of WinningCombos[GameWinCondition.index]) {
      document.getElementById(index).style.backgroundColor = 
        GameWinCondition.player === huPlayer ? "blue" : "red";
    }
    //Makes it so that you cant Click anymore on the board and just displays win or lose
    for (let i=0; i < Boxes.length; i++) {
      Boxes[i].removeEventListener('click', TurnBehavior, false);
    }
    declareWinner(GameWinCondition.player === huPlayer ? "You win!" : "You lose");
  }
  //Winner
  function declareWinner(who) {
    //Displays Endgame
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
  }
  //Finds all empty Squares by filtering out every box with an element
  function emptySquares() {
    return Board.filter((elm, i) => i===elm);
  }
    //Finds best spot for Ai using minmax algor
  function bestSpot(){
    return minimax(Board, aiPlayer).index;
  }
    //Finds if its a Tie
  function CheckTieCondition() {
    if (emptySquares().length === 0){
      for (cell of Boxes) {
        //Removes the ability to click the board and change color to green
        cell.style.backgroundColor = "green";
        cell.removeEventListener('click',TurnBehavior, false);
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
    if (CheckWinCondition(newBoard, huPlayer)) {
      return {score: -10};
    } else if (CheckWinCondition(newBoard, aiPlayer)) {
      return {score: 10};
    } else if (availSpots.length === 0) {
      return {score: 0};
    }
    //Based on the values from above, it determines the place to which the ai should go to always be in the optimal location, Complicated worth testing program and trying to get the root behind this logic
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
