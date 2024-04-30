const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = "mongodb+srv://Nettles:1111@unbeatabletictactoeclus.kwq3wwi.mongodb.net/?retryWrites=true&w=majority&appName=UnbeatableTicTacToeCluster";
const app = express();
const PORT = 3002;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// Serve static files from the 'public' folder in src folder
app.use(express.static('src/public'));

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB when the server starts
async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if connection fails
  }
}

// Fetch game data from MongoDB
async function fetchGameData() {
  try {
    const database = client.db("tictactoeAIWins");
    const collection = database.collection("AIWins");
    const gameData = await collection.findOne();
    return gameData;
  } catch (error) {
    console.error("Error fetching game data:", error);
    throw error; // Propagate the error to the caller
  }
}

// Define a route to fetch game data
app.get('/api/gameData', async (req, res) => {
  try {
    const gameData = await fetchGameData();
    res.json(gameData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch game data" });
  }
});


// Define a route to store game data in MongoDB
app.post('/api/storeGameData', async (req, res) => {
  try {
      const { date, numOfSearches, outcome } = req.body; // Extract data from the request body

      // Access the MongoDB collection from the connected client
      const database = client.db("tictactoeAIWins");
      const collection = database.collection("AIWins");

      // Check if an entry with the same date already exists in the database
      const existingGameData = await collection.findOne({ date });

      // If an entry with the same date exists, you can choose to update it
      if (existingGameData) {
          //  write code to update the existing entry

          // Send a success response
          return res.status(200).json({ message: 'Entry already exists for date. No new entry added.' });
      }

      // Otherwise, if no entry exists for the date, insert the new entry into the database
      await collection.insertOne({ date, numOfSearches, outcome });
      console.log('New entry added for date:', date);
      // Send a success response
      res.status(200).json({ message: 'New entry added successfully for date.' });
  } catch (error) {
      console.error('Error storing game data in MongoDB:', error);
      // Send an error response
      res.status(500).json({ error: 'Failed to store game data in MongoDB' });
  }
});






// Function to format the current date as "MM-DD-YYYY"
function getFormattedDate() {
  const currentDate = new Date();
  return currentDate.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
}

// Start the server after connecting to MongoDB
async function startServer() {
  await connectToMongoDB();
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/TicTacToe.html`);
  });
}

// Function to store the formatted date in MongoDB
// async function storeDateInMongoDB() {
//   try {
//     const formattedDate = getFormattedDate();
//     const database = client.db("tictactoeAIWins");
//     const collection = database.collection("AIWins");
//     await collection.insertOne({ date: formattedDate });
//     console.log("Formatted date stored in MongoDB:", formattedDate);
//   } catch (error) {
//     console.error("Error storing formatted date in MongoDB:", error);
//   }
// }

// Start the server and store the formatted date in MongoDB
startServer();















//////////////////////////////////////////////////////////////










// const express = require('express');
// const { MongoClient, ServerApiVersion } = require('mongodb');

// const uri = "mongodb+srv://Nettles:1111@unbeatabletictactoeclus.kwq3wwi.mongodb.net/?retryWrites=true&w=majority&appName=UnbeatableTicTacToeCluster";
// const app = express();
// const PORT = 3002;

// // Serve static files from the 'public' folder in src folder
// app.use(express.static('src/public'));

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// // Connect to MongoDB when the server starts
// async function connectToMongoDB() {
//   try {
//     await client.connect();
//     console.log("Connected to MongoDB!");
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//     process.exit(1); // Exit the process if connection fails
//   }
// }

// // Fetch game data from MongoDB
// async function fetchGameData() {
//   try {
//     const database = client.db("tictactoeAIWins");
//     const collection = database.collection("AIWins");
//     const gameData = await collection.findOne();
//     return gameData;
//   } catch (error) {
//     console.error("Error fetching game data:", error);
//     throw error; // Propagate the error to the caller
//   }
// }

// // Define a route to fetch game data
// app.get('/api/gameData', async (req, res) => {
//   try {
//     const gameData = await fetchGameData();
//     res.json(gameData);
//   } catch (error) {
//     res.status(500).json({ error: "Failed to fetch game data" });
//   }
// });


// // Start the server after connecting to MongoDB
// async function startServer() {
//   await connectToMongoDB();
//   app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}/TicTacToe.html`);
//   });
// }

// // Start the server
// startServer();
