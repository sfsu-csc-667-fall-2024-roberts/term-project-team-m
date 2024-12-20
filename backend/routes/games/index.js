import express from "express";
import { Games } from "../../db/index.js";
import { Sql } from "../../db/games/index.js";

import db from "../../db/connection.js" // Import database connection details from the db folder
import { io } from '../../server.js'; // Import the socket io from server.js



const router = express.Router();

// This is the route used by the "New Game" button in the lobby to make a new game
router.post("/create", async (request, response) => {
  const { id: creatorId } = request.session.user;
  const { description } = request.body;

  try {
    const id = await Games.create(creatorId, description);
    response.redirect(`/games/${id}`);
  } catch (error) {
    // Redirect to lobby if there was any error....
    response.redirect("/lobby");
  }
});

// This is the route for rendering the actual game interface on the page of the game id
router.get("/:id", async (request, response) => {
  const { id: gameId } = request.params;

  try {
    // Find this game first, using the matching gameId
    const gameQuery = 'SELECT * FROM games WHERE id = $1';
    const gameRes = await db.query(gameQuery, [gameId]);
    const foundGame = gameRes[0];
    // Print the entire gameRes so I can see all the info on the game it found
    //console.log(gameRes);


    // Fetching users that are in this game
    // Get the id, email, and gravatar of users that are in this game_id
    const usersQuery = `
    SELECT users.id, users.email, users.gravatar, game_users.seat
    FROM game_users
    JOIN users ON game_users.user_id = users.id
    WHERE game_users.game_id = $1
    `;
    const usersRes = await db.query(usersQuery, [gameId]);
    //console.log('Users in game:', usersRes);
    console.log("Query found " + usersRes.length + " user(s) in the database in this game");
    // Debugging statement to help me see what was in the usersRes query response because otherwise it prints as [object Object]
    // for (let i = 0; i < usersRes.length; i++) {
    //   Object.keys(usersRes[i]).forEach((prop) => console.log(prop, usersRes[i][prop]));
    // }


    // Map user data to a more accessible format because otherwise this clowns out saying [object Object]
    const gameUsers = usersRes.map(user => ({
      id: user.id,
      email: user.email,
      gravatar: user.gravatar,
      seat: user.seat
    }));

    // const firstUser = usersRes[0];
    // const seat = firstUser.seat;
    // console.log('Seat of the first user:', seat);
    //console.log('Game users with seat values:', gameUsers);


    // Fetch all necessary card data for both players by querying the game_cards table for matching game_id, user_id, and location
    // ________________________________________________________________________________________________________
    // Query for cards in game_cards that have this game_id, that are in location "player1Hand", and they are actually attached to user_id of player 1
    const player1HandQuery = `SELECT * FROM game_cards WHERE game_id = $1 AND location = $2 AND user_id = $3`;
    const player1Hand = await db.query(player1HandQuery, [gameId, 'player1Hand', gameUsers[0].id]);

    // Debugging statement to help me see what is actually in the query response that should be cards in the game that match player1Hand
    // console.log("player 1 handQuery result is " + player1Hand);
    // for (let i = 0; i < player1Hand.length; i++) {
    //   Object.keys(player1Hand[i]).forEach((prop) => console.log(prop, player1Hand[i][prop]));
    // }

    // Query for cards in game_cards that have this game_id, that are in location "player1FaceUps", and they are actually attached to user_id of player 1
    const player1FaceUpsQuery = 'SELECT * FROM game_cards WHERE game_id = $1 AND location = $2 AND user_id = $3';
    const player1FaceUps = await db.query(player1FaceUpsQuery, [gameId, 'player1FaceUps', gameUsers[0].id]);

    // Query for cards in game_cards that have this game_id, that are in location "player1FaceDowns", and they are actually attached to user_id of player 1
    const player1FaceDownsQuery = 'SELECT * FROM game_cards WHERE game_id = $1 AND location = $2 AND user_id = $3';
    const player1FaceDowns = await db.query(player1FaceDownsQuery, [gameId, 'player1FaceDowns', gameUsers[0].id]);

    // Query for cards in game_cards that have this game_id, that are in location "drawingDeck"
    // This is used to fill out the drawing deck stats on the page (like the number of cards remaining in it)
    const drawingDeckQuery = 'SELECT * FROM game_cards WHERE game_id = $1 AND location = $2';
    const drawingDeck = await db.query(drawingDeckQuery, [gameId, 'drawingDeck']);

    // Print everything in the drawing deck so I can see what it found
    // for (let i = 0; i < drawingDeck.length; i++) {
    //   Object.keys(drawingDeck[i]).forEach((prop)=> console.log(prop, drawingDeck[i][prop]));
    // } 

    // Query for cards in game_cards that have this game_id, that are in location "playingPile"
    // This is used to fill out the playingPile interface on the page (like the number of cards in it, and eventually what card is the one on top (the active one))
    const playingPileQuery = 'SELECT * FROM game_cards WHERE game_id = $1 AND location = $2';
    const playingPile = await db.query(playingPileQuery, [gameId, 'playingPile']);


    // Print everything it found to be a playingPile card...
    // for (let i = 0; i < playingPile.length; i++) {
    //   Object.keys(playingPile[i]).forEach((prop)=> console.log(prop, playingPile[i][prop]));
    // } 

    // Declare data before setting it...
    let gameData;

    if (usersRes.length > 1) { // If at least 2 players in game
      console.log("usersRes length was greater than 1, meaning this game has both players");

      const player2HandQuery = 'SELECT * FROM game_cards WHERE game_id = $1 AND location = $2 AND user_id = $3';
      let player2Hand = await db.query(player2HandQuery, [gameId, 'player2Hand', gameUsers[1].id]);

      const player2FaceUpsQuery = 'SELECT * FROM game_cards WHERE game_id = $1 AND location = $2 AND user_id = $3';
      let player2FaceUps = await db.query(player2FaceUpsQuery, [gameId, 'player2FaceUps', gameUsers[1].id]);

      const player2FaceDownsQuery = 'SELECT * FROM game_cards WHERE game_id = $1 AND location = $2 AND user_id = $3';
      let player2FaceDowns = await db.query(player2FaceDownsQuery, [gameId, 'player2FaceDowns', gameUsers[1].id]);


      // If two players were found in the game..., render both player 1 and player 2 fully
      gameData = {
        gameID: foundGame.id, // Pass the game id of this game just to be sure.
        description: foundGame.description, // Have it render the found game description
        users: gameUsers, // Have it render the users it found
        player1Hand: player1Hand, // Display player 1 hand
        player1FaceUps: player1FaceUps, // Display player 1 face up cards
        player1FaceDowns: player1FaceDowns, // Displaya player 1 face down cards
        player2Hand, //Display player 2 hand
        player2FaceUps, // Display player 2 face up cards
        player2FaceDowns, // Display player 2 face down cards
        drawingDeck: drawingDeck || [], // Give it the data for the drawing deck
        playingPile: playingPile || [], // Also send the array of all cards in the playingPile
        pileValue: foundGame.game_pile_value, // Also send the game's pile value
        gameTurn: foundGame.which_player_turn, // Also send the game's current turn
      };
    } else { // If only one player in game, do not render player 2 because they do not have anything yet
      console.log("usersRes length was NOT greater than 1, meaning only the host is in the game");

      // Set more minimal game data, with player 2's cards set to empty because they haven't been assigned to them yet
      gameData = {
        gameID: foundGame.id, // Pass the game id of this game just to be sure.
        description: foundGame.description, // Have it render the found game description
        users: gameUsers, // Have it render the user it found
        player1Hand: player1Hand || [], // Display player 1 hand
        player1FaceUps: player1FaceUps || [], // Display player 1 face up cards
        player1FaceDowns: player1FaceDowns || [], // Display player 1 face down cards
        player2Hand: [], // Don't display player 2 because they have not joined yet
        player2FaceUps: [], // Don't display player 2 because they not joined yet
        player2FaceDowns: [], // Don't display player 2 ... ^^^ same reason
        drawingDeck: drawingDeck || [], // Give it the data for the drawing deck
        playingPile: playingPile || [], // Also send the array of all cards in the playingPile
        pileValue: foundGame.game_pile_value, // Also send the game's pile value
        gameTurn: foundGame.which_player_turn, // Also send the game's current turn
      };
    }

    response.render('games/gameInterface', gameData);

  } catch (error) {
    console.error(error);
    response.status(500).send('Server Error');
  }
});

// Route used by the available games section on the lobby to join a game
router.post("/join/:id", async (request, response) => {
  const { id: gameId } = request.params;
  const { id: userId } = request.session.user;

  try {
    await Games.joinGame(gameId, userId);

    response.redirect(`/games/${gameId}`);

    // Trigger an event to refresh the page
    io.emit('refresh-page');
  } catch (error) {
    console.log(error);
    response.redirect("/lobby");
  }
});

// Route used to draw a new card for a user in a game
router.post("/draw/:id", async (request, response) => {
  const { game_id: gameId } = request.body; // Get the game_ID for the game to draw a card in
  const { card_id: card_id } = request.body;
  // const { suit: suit } = request.body;
  // const { value: value } = request.body;
  // const { card_name: card_name } = request.body;
  // const { user_id: user_id } = request.body;
  const { location: location } = request.body; // Get the location that the card needs to be assinged to
  const { id: userId } = request.session.user; // Get the user that will be assigned this new card

  try {
    await db.none(Sql.ASSIGN_CARDS, [userId, location, gameId, [card_id]]);

    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.log(error);
    response.redirect("/lobby");
  }
});

router.post("/pile/:id", async (request, response) => {
  // {"id":47,"suit":0,"value":8,"card_name":"8","user_id":null,"game_id":1,"location":"drawingDeck"},
  const { game_id: gameId } = request.body;
  const { card_ids: cardIds } = request.body;
  const { location: location } = request.body;
  const { id: userId } = request.session.user;

  try {
    await db.none(Sql.ASSIGN_CARDS, [userId, location, gameId, cardIds]);
    // Also need to make it set the pileValue for this game to 0
    // Update the games table to set game_pile_value to 0 because they picked up the pile
    const newPileValue = 0;
    await db.none('UPDATE games SET game_pile_value = $1 WHERE id = $2', [newPileValue, gameId]);

    response.redirect(`/games/${gameId}`);
  } catch (error) {
    console.log(error);
  }
});

router.post("/play/:id", async (request, response) => {
  // Hardcoded test data to see if this would work
  // {"id":47,"suit":0,"value":8,"card_name":"8","user_id":null,"game_id":1,"location":"drawingDeck"},

  // Retrieve the details about the card to play from the request.
  const { game_id: gameId } = request.body; // Get the game id where this card is from
  const { card_id: cardId } = request.body; // Get the card id
  const { location: location } = request.body; // Get the card location
  const { card_owner_id: cardUserId } = request.body; // Get the user ID of the card that was clicked on
  const { id: userId } = request.session.user; // Get the user ID of the user who made this request from the browser

  try {
    console.log("Inside play card endpoint.")
    console.log("Card Owner ID:", cardUserId);
    console.log("User ID:", userId);

    // Make sure the person who tried to play this card is the actual owner of it
    if (cardUserId == userId) {
      // If the card belongs to the user, play it onto the play pile location
      await db.none(Sql.ASSIGN_CARDS, [userId, location, gameId, [cardId]]);

      // Fetch the card value of this card from game_cards table
      const card = await db.oneOrNone('SELECT value FROM game_cards WHERE id = $1', [cardId]);
      const cardValue = card.value; // Save the value of that card
      console.log("Card Value inside play card is: " + cardValue);

      // Retrieve the gamePileValue for this game for use in determining what to do about special card 8
      const game = await db.oneOrNone('SELECT game_pile_value FROM games WHERE id = $1', [gameId]);
      const gamePileValue = game ? game.game_pile_value : 0;
      console.log("Game pile value in play card endpoint retrieved: " + gamePileValue);


      // If the pile has a value of 0, set it to the card value regardless of the card being played
      if (gamePileValue === 0) {
        console.log("Pile value determined to be 0");
        // Play any card as normal, even 8, when there is no value on the pile functions as a regular 8
        await db.none('UPDATE games SET game_pile_value = $1 WHERE id = $2', [cardValue, gameId]);
      } else {
        console.log("Non-zero value on pile detected: " + gamePileValue);
        // If there is a value on the pile...
        // Update the games table to set game_pile_value to this card's value
        if (cardValue === 8) {
          console.log("Detected special case when playing 8.");
          // If trying to play an 8, don't change the pile value if there is one already, as 8 keeps the previous value in place
          response.status(200).json({ message: "Card played successfully." });
          return;
        } else {
          console.log("Inside case to play other cards as normal");
          // Play other cards normally when there is a value on the pile
          await db.none('UPDATE games SET game_pile_value = $1 WHERE id = $2', [cardValue, gameId]);
        }
      }
      response.status(200).json({ message: "Card played successfully." });

    } else { // If they tried to play someone else's card
      console.log("This card is not from your hand.")
      response.status(111).json({ error: "You can't play someone else's card." });
      return;
    }

  } catch (error) {
    console.error("Error in play card route in games/index.js:", error);
    response.status(500).json({ error: "Something exploded on the server and I can't tell you what..." });
  }
  // io.emit('refresh-page');
});

// Adding a page refresh route here to see if it is more stable than having it in the other routes folder
router.post('/triggerRefresh', (req, res) => {
  io.emit('refresh-page');
  res.status(200).send('Page refresh event emitted to server');
});

// Route used to change player turns in a game, first it retrieves the turn value for that game and then it changes it to the other player based on what it found
router.post("/advancePlayerTurn", async (request, response) => {
  const { game_id: gameId } = request.body;

  try {
    // Get the current turn in this game from the game table
    const game = await db.one('SELECT which_player_turn FROM games WHERE id = $1', gameId);

    // Determine which player's turn to set it to
    let newPlayerTurn;

    // If it was player 1's turn...
    if (game.which_player_turn === 1) {
      newPlayerTurn = 2; // Set it to player 2's turn
    }
    // And vice versa... if 2, then set to 1
    else if (game.which_player_turn === 2) {
      newPlayerTurn = 1;
    } else {
      // This shouldn't happen, but if it does I want to know
      throw new Error(`Invalid which_player_turn value: ${game.which_player_turn}`);
    }

    // Now set that new turn value for that game
    await db.none('UPDATE games SET which_player_turn = $1 WHERE id = $2', [newPlayerTurn, gameId]);
    response.redirect(`/games/${gameId}`);

  } catch (error) {
    console.log(error);
  }
});


// Export all of these so they can be used by server.js to send to the other files in this application
export default router;
