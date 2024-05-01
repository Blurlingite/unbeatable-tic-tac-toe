// Fetch game data from the server and update HTML content
// function fetchGameDataAndUpdateHTML() {
//   fetch('/api/gameData')
//       .then(response => {
//           if (!response.ok) {
//               throw new Error('Network response was not ok');
//           }
//           return response.json();
//       })
//       .then(data => {
//           // Update HTML content with the fetched data
//           const gameDataContainer = document.getElementById('gameDataContainer');
//           gameDataContainer.innerHTML = `<p>Game ID: ${data.date_time_id}</p>`; // Example: Displaying game ID
//       })
//       .catch(error => {
//           console.error('There was a problem with the fetch operation:', error);
//       });
// }


// Call the fetch function when the DOM content is loaded
// document.addEventListener('DOMContentLoaded', () => {
//   fetchGameDataAndUpdateHTML();
// });




/////////////////////////////////////////////////////////////////////////////////








//Initalize the Board
var ticTacToeBoard;


var numOfSearches = 0;
var outcome = "";

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
    User = SystemSelect;
    RoboPlayer = SystemSelect==='O' ? 'X' :'O';
    ticTacToeBoard = Array.from(Array(9).keys());
    for (let i = 0; i < Boxes.length; i++) {
      Boxes[i].addEventListener('click', TurnBehavior, false);
    }
    if (RoboPlayer === 'X') {
      TurnUpdate(bestSquare(),RoboPlayer);
    }
    document.querySelector('.SelectionPrompt').style.display = "none";
  }





function storeGameDataInDatabase(){
  const currentDate = new Date(); // Get the current date when starting a new game
  const formattedDate = currentDate.toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
});

     // Make an HTTP POST request to the server to store the game data
    const responseFromServer =  fetch('/api/storeGameData', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: formattedDate, numOfSearches, outcome })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Failed to store game data in MongoDB');
      }
      console.log('Game data stored successfully in MongoDB');
  })
  .catch(error => {
      console.error('Error storing game data in MongoDB:', error);
  });

}





function startGame() {

//Whenever button is clicked or initalized it is setting values
    document.querySelector(".endgame").style.display = "none";
    document.querySelector('.endgame .text').innerText ="";
    document.querySelector('.SelectionPrompt').style.display = "block";
    ticTacToeBoard = Array.from(Array(9).keys());
    //Clears the board
    for (let i = 0; i < Boxes.length; i++) {
        Boxes[i].innerText = '';
        Boxes[i].style.removeProperty('background-color');
	}
}




//Logs the Place the player and AI opponent clicks
function TurnBehavior(square) {
	if (typeof ticTacToeBoard[square.target.id] ==='number') {
        TurnUpdate(square.target.id, User);
        //After user takes a TurnUpdate, AI takes TurnUpdate for best spot
        if (!CheckWinCondition(ticTacToeBoard, User) && !CheckTieCondition())  
          TurnUpdate(bestSquare(), RoboPlayer);
      }
}




//Updates the place clicked on the board with the variable we set for Player
function TurnUpdate(squareId, player) {
  ticTacToeBoard[squareId] = player;
    document.getElementById(squareId).innerHTML = player;

        //Runs CheckWinCondition function Then GameOverCondition, Finds who won then runs commands at end of game

    let GameWinCondition = CheckWinCondition(ticTacToeBoard, player);
    if (GameWinCondition) GameOverCondition(GameWinCondition);
    CheckTieCondition();
  }



  //See if we win
  function CheckWinCondition(ticTacToeBoard, player) {
    //Finds all places on board that has been played in
    //Reduces all elements to find the places where nothing is played in
    let plays = ticTacToeBoard.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
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
        GameWinCondition.player === User ? "green" : "orange";
    }
    //Makes it so that you cant Click anymore on the board and just displays win or lose
    for (let i=0; i < Boxes.length; i++) {
      Boxes[i].removeEventListener('click', TurnBehavior, false);
    }
    revealVictor(GameWinCondition.player === User ? "You actually won?" : "Unfortunately you've lost!");
  }




  //Winner
  function revealVictor(playerOrAI) {
    //Displays Endgame
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = playerOrAI;
    outcome = "Win"; // used to store in database
    storeGameDataInDatabase();
  }



  //Finds all empty Squares by filtering out every box with an element
  function emptySquares() {
    return ticTacToeBoard.filter((elm, i) => i===elm);
  }




    //Finds if its a Tie
  function CheckTieCondition() {
    if (emptySquares().length === 0){
      for (cell of Boxes) {
        //Removes the ability to click the board and change color to green
        cell.style.backgroundColor = "green";
        cell.removeEventListener('click',TurnBehavior, false);
      }
      revealVictor("It's a tie!");
      return true;
    } 
    return false;
  }





    //Finds best spot for Ai using minmax algor
    function bestSquare(){
      return minimaxAlgorithm(ticTacToeBoard, RoboPlayer).index;
    }




  //MinMax Algorithm, makes it unbeatable
  function minimaxAlgorithm(newticTacToeBoard, player) {
    var availableSquares = emptySquares(newticTacToeBoard);
    // Sets values for win cases either player or AI
    if (CheckWinCondition(newticTacToeBoard, User)) {

      return {score: -10};

    } else if (CheckWinCondition(newticTacToeBoard, RoboPlayer)) {

      return {score: 10};

    } else if (availableSquares.length === 0) {

      return {score: 0};
    }
    //Based on the values from above, it determines the place to which the ai should go to always be in the optimal location, Complicated worth testing program and trying to get the root behind this logic
    var moves = [];
    for (let i = 0; i < availableSquares.length; i ++) {
      var move = {};
      move.index = newticTacToeBoard[availableSquares[i]];
      newticTacToeBoard[availableSquares[i]] = player;
      
      if (player === RoboPlayer)
        move.score = minimaxAlgorithm(newticTacToeBoard, User).score;
      else
         move.score =  minimaxAlgorithm(newticTacToeBoard, RoboPlayer).score;
      newticTacToeBoard[availableSquares[i]] = move.index;
      if ((player === RoboPlayer && move.score === 10) || (player === User && move.score === -10))
        return move;
      else 
        moves.push(move);
    }
    
    let bestMove, bestScore;
    if (player === RoboPlayer) {
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
    
    // used to store how many searches the AI took
    numOfSearches = numOfSearches + 1; 

    return moves[bestMove];
  }

 






  // function minimaxAlphaBetaPrune(newticTacToeBoard, player, alpha, beta) {
  //   var availableSquares = emptySquares(newticTacToeBoard);
  
  //   if (CheckWinCondition(newticTacToeBoard, User)) {
  //     return { score: -10 };
  //   } else if (CheckWinCondition(newticTacToeBoard, RoboPlayer)) {
  //     return { score: 10 };
  //   } else if (availableSquares.length === 0) {
  //     return { score: 0 };
  //   }
  
  //   var moves = [];
  
  //   for (let i = 0; i < availableSquares.length; i++) {
  //     var move = {};
  //     move.index = newticTacToeBoard[availableSquares[i]];
  //     newticTacToeBoard[availableSquares[i]] = player;
  
  //     // If its the AI's turn, updaate alpha, otherwise update beta if itss player's turn
  //     if (player === RoboPlayer) {
  //       move.score = minimaxAlgorithm(newticTacToeBoard, User, alpha, beta).score;
  //       if (move.score > alpha) {
  //         alpha = move.score;
  //       }
  //     } else {
  //       move.score = minimaxAlgorithm(newticTacToeBoard, RoboPlayer, alpha, beta).score;
  //       if (move.score < beta) {
  //         beta = move.score;
  //       }
  //     }
  
  //     newticTacToeBoard[availableSquares[i]] = move.index;
  
  //     // if alpha is greater, the current move is useless so prune it by breaking out of for loop
  //     if (alpha >= beta) {
  //       break; 
  //     }
  
  //     moves.push(move);
  //   }
  
  //   let bestMove, bestScore;
  
  //   if (player === RoboPlayer) {
  //     bestScore = -1000;
  //     for (let i = 0; i < moves.length; i++) {
  //       if (moves[i].score > bestScore) {
  //         bestScore = moves[i].score;
  //         bestMove = i;
  //       }
  //     }
  //   } else {
  //     bestScore = 1000;
  //     for (let i = 0; i < moves.length; i++) {
  //       if (moves[i].score < bestScore) {
  //         bestScore = moves[i].score;
  //         bestMove = i;
  //       }
  //     }
  //   }
  
  //   numOfSearches = numOfSearches + 1;
  
  //   return moves[bestMove];
  // }
  