import express from "express";
import { Games } from "../../db/index.js";
import { Sql } from "../../db/games/index.js";
import db from "../../db/connection.js" // Import database connection details from the db folder

import { io } from '../../server.js'; // Import the socket io from server.js



const router = express.Router();

// Debugging function to see if I can trigger a socket event here
function triggerSocketRefreshPageEvent() {
    // Trigger an event to refresh the page
    io.emit('refresh-page');
}

// Test route that could trigger the function to go off
router.get('/triggerRefresh', (req, res) => {
    triggerSocketRefreshPageEvent();
    res.send('Refresh page event triggered');
});



// Route used by the gameHelper js valid play function that takes a card and finds it's game and the game's pile value and sends it back
router.get("/getGamePileValue", async (request, response) => {
    const cardID = request.query.cardID;

    console.log("Beginning getGamePileValue route, input cardID is: " + cardID);

    try {
        // Query the game_cards table
        console.log("Inside game pile value before cardQuery");
        const cardQueryResponse = await db.query('SELECT id, value, card_name, game_id, location FROM game_cards WHERE id = $1', [cardID]);

        if (!cardQueryResponse) {
            console.log("No card query response data");
            throw new Error(`No card with ID ${cardID} found??`);
        }

        console.log("Before storing query response data in vars");
        // Store the card name and value for this card from the database (this is extracted here so the user can't just edit the page html)
        const foundCardName = cardQueryResponse[0].card_name;
        console.log("Found card name is: " + foundCardName);
        const foundCardValue = cardQueryResponse[0].value;
        console.log("Found card value is: " + foundCardValue);

        const foundCardLocation = cardQueryResponse[0].location;
        console.log("Found card location is: " + foundCardLocation);


        // Store the gameID attached to this card
        const gameID = cardQueryResponse[0].game_id;
        console.log("Card says the game ID value is: " + gameID);

        console.log("Before gameQuery");
        // Query the games table for that gameID
        const gameQuery = await db.query('SELECT id, game_pile_value FROM games WHERE id = $1', [gameID]);
        console.log("INSIDE GAME PILE VALUE AFTER DB QUERY")
        const foundGameID = gameQuery[0].id;
        console.log("Found game ID is: " + foundGameID);
        const foundGamePileValue = gameQuery[0].game_pile_value;
        console.log("Found game pile value is: " + foundGamePileValue);

        if (!gameQuery) {
            throw new Error(`Game with ID ${gameID} not found.`);
        }

        // Construct the response object
        const res = {
            game_id: foundGameID, // Send back the found game ID
            game_pile_value: foundGamePileValue, // Send back the found game's pile value
            card_name: foundCardName, // Send back the card name of this card, as found in the database
            card_value: foundCardValue, // Send back the card name of this card, as found in the database
            location: foundCardLocation, // Send back the location of this card, as found in the database 
        };
        
        // Send response
        console.log("Reached end of getGamePileRoute");
        return response.status(200).json(res);

    } catch (error) {
        console.error('Error in this getGamePileValue route:', error.message);
        response.status(500).json({ error: error.message });
    }
});

// GET Route used to retrieve the players in a given game from the game_users table
router.get("/gamePlayers/:game_id", async (request, response) => {
    // Get the game to look for from the request
    const gameId = request.params.game_id;
  
    try {
      // Fetch players in the game with their user_id and seat
      const players = await db.any(
        'SELECT user_id, seat FROM game_users WHERE game_id = $1', [gameId]);
  
      // Respond with the fetched players (as JSON)
      response.json(players);
    } catch (error) {
      console.error('Error retrieving game players:', error);
      response.status(500).json({ error: 'Failed to retrieve game players' });
    }
  });



// Export all of these so they can be used by server.js to send to the other files in this application
export default router;