// This appears to be where games are actually being created by the new game button
// It inserts the creator and description (actually game name in practice) into the database in the CREATE: section
// As well as adds that player into the game users for that game in the ADD_PLAYER section
// This is also responsible for creating the list of available games on the lobby page in the GET_AVAILABLE section of the code

import db, { pgp } from "../connection.js";

export const Sql = {
  CREATE:
    "INSERT INTO games (creator_id, description) VALUES ($1, $2) RETURNING id",
  UPDATE_DESCRIPTION: "UPDATE games SET description=$1 WHERE id=$2",
  ADD_PLAYER:
    "INSERT INTO game_users (game_id, user_id, seat) VALUES ($1, $2, $3)",
  IS_PLAYER_IN_GAME:
    "SELECT * FROM game_users WHERE game_users.game_id=$1 AND game_users.user_id=$2",
  GET_GAME: "SELECT * FROM games WHERE id=$1",
  GET_USERS:
    "SELECT users.id, users.email, users.gravatar, game_users.seat FROM users, game_users, games WHERE games.id=$1 AND game_users.game_id=games.id AND game_users.user_id=users.id ORDER BY game_users.seat",
  
  // Games that I am not already part of, and have a slot for me to join
  GET_AVAILABLE: `
    SELECT games.*, users.email, users.gravatar 
    FROM games
    INNER JOIN (
        SELECT game_users.game_id
        FROM game_users 
        GROUP BY game_id
        HAVING COUNT(*) < 2
    ) AS temp ON games.id=temp.game_id
    LEFT JOIN users ON users.id=games.creator_id
    WHERE games.id > $[game_id_start]
    AND games.id NOT IN (
        SELECT game_id 
        FROM game_users 
        WHERE user_id = $[user_id]
    )
    ORDER BY games.id
    LIMIT $[limit]
    OFFSET $[offset]
  `,
  // Games that have my user_id in them, so if I leave I can rejoin
  GET_MY_GAMES: `
    SELECT games.*, users.email, users.gravatar 
    FROM games
    INNER JOIN game_users ON games.id = game_users.game_id
    LEFT JOIN users ON users.id=games.creator_id
    WHERE game_users.user_id = $[user_id]
    ORDER BY games.id
  `,
  // Full games that don't have my user_id in them, but I could watch
  GET_SPECTATE_GAMES: `
    SELECT games.*, users.email, users.gravatar 
    FROM games
    INNER JOIN (
        SELECT game_users.game_id
        FROM game_users 
        GROUP BY game_id
        HAVING COUNT(*) = 2
    ) AS temp ON games.id=temp.game_id
    LEFT JOIN users ON users.id=games.creator_id
    WHERE games.id NOT IN (
        SELECT game_id 
        FROM game_users 
        WHERE user_id = $[user_id]
    )
    ORDER BY games.id
  `,
  SHUFFLED_DECK:
    "SELECT *, random() AS rand FROM standard_deck_cards ORDER BY rand",
  ASSIGN_CARDS:
    "UPDATE game_cards SET user_id=$1, location=$2 WHERE game_id=$3 AND id = ANY($4::int[])",
  DRAW_CARDS:
    "SELECT * FROM game_cards WHERE game_id=$1 AND location='drawingDeck' ORDER BY id LIMIT $2",
  INITIALIZE_GAME_CARDS:
    "INSERT INTO game_cards (user_id, game_id, card_id, card_order, location) VALUES ($1, $2, $3, $4, 'drawingDeck')",
  GET_CARDS: `
    SELECT * FROM game_cards, standard_deck_cards
    WHERE game_cards.game_id=$1 AND game_cards.id=standard_deck_cards.id`,
};

// Used to create a new game by the lobby page create game button
// Create a new game, stores the creator's ID in the database games table, and the description which is actually the name of the game, functionally
const create = async (creatorId, description) => {
  try {
    const { id } = await db.one(Sql.CREATE, [
      creatorId,
      description || "placeholder",
      1,
    ]);

    if (description === undefined || description.length === 0) {
      await db.none(Sql.UPDATE_DESCRIPTION, [`Game ${id}`, id]);
    }

    await db.none(Sql.ADD_PLAYER, [id, creatorId, 1]);

    // Initialize the game with cards
    await initializeGame(id, creatorId);

    return id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// Initialize a game with cards
const initializeGame = async (gameId, creatorId) => {
  try {
    // Get a shuffled deck
    const deck = await db.any(Sql.SHUFFLED_DECK);

    // Function to get card name based on value
    const getCardName = (value) => {
      switch (value) {
        case 11:
          return 'Jack';
        case 12:
          return 'Queen';
        case 13:
          return 'King';
        case 14:
          return 'Ace';
        default: // Otherwise for number cards... just get the number..
          return value.toString();
      }
    };

    // Insert cards into game_cards table with certain default values
    const columns = new pgp.helpers.ColumnSet(
      ["suit", "value", "card_name", "user_id", "game_id", "location"],
      { table: "game_cards" },
    );

    const gameCardsValues = deck.map(({ id, suit, value }) => ({
      suit,
      value,
      card_name: getCardName(value),  // Set card name based on value
      user_id: null,  // Set user_id to null initially
      game_id: gameId,
      location: "drawingDeck"  // Set location to "drawingDeck" initially
    }));

    // Insert these values into the database game_cards table
    const query = pgp.helpers.insert(gameCardsValues, columns);
    // Wait for the query to finish
    await db.none(query);

    //console.log("Game_cards (drawingDeck) contains is: " + gameCardsValues);

    console.log(`Game initialized successfully with ID ${gameId}`);

    // Assign cards to player1, the game creator
    // Because they are present at the initialization I can do this now
    // Parameters are GameId  Seat  UserID
    await assignCardsToPlayer(gameId, 1, creatorId);
    console.log(`Cards assigned to player game creator, player 1, successfully.`);

    // Test assigning cards to player 2
    //await assignCardsToPlayer(gameId, 1, 2);
    //console.log(`Cards assigned to second player, player 2, successfully.`);

  } catch (error) {
    console.error(`Error initializing game: ${error.message}`);
    throw error;
  }
};

// Assign cards to a given player
// First draws them out of the game_cards table by finding the first 9 that are in the drawingDeck location
// then assigns these cards to the player's hand, faceUps, and faceDowns.
const assignCardsToPlayer = async (gameId, seat, userId = null) => {
  try {
    // Draw 9 cards from the drawing deck
    const drawCards = await db.any(Sql.DRAW_CARDS, [gameId, 9]);

    // Split the drawn cards into hand, faceUps, and faceDowns
    const handCards = [];
    const faceUpCards = [];
    const faceDownCards = [];

    while (drawCards.length > 0) {
      // Randomly pick a card from the remaining drawCards
      const randomIndex = Math.floor(Math.random() * drawCards.length);
      const selectedCard = drawCards[randomIndex];

      // Remove the selected card from the drawCards array so we can't pick it again
      drawCards.splice(randomIndex, 1);

      // Assign the card to the player's hand(s)
      if (handCards.length < 3) {
        handCards.push(selectedCard);
      } else if (faceUpCards.length < 3) {
        faceUpCards.push(selectedCard);
      } else {
        faceDownCards.push(selectedCard);
      }
    }

    

    // Some maps used to store the ID's of the cards that were changed
    const handCardIds = handCards.map(card => card.id);
    console.log("HandCardIDs is: " + handCardIds);
    const faceUpCardIds = faceUpCards.map(card => card.id);
    console.log("faceUpCardIDs is: " + faceUpCardIds);
    const faceDownCardIds = faceDownCards.map(card => card.id);
    console.log("faceDownCardIds is: " + faceDownCardIds);

    // Validate if the player is present in the game and assign cards by changing their location in the game_cards table to the player's relevant part
    await db.none(Sql.ASSIGN_CARDS, [userId, `player${seat}Hand`, gameId, handCardIds]);
    await db.none(Sql.ASSIGN_CARDS, [userId, `player${seat}FaceUps`, gameId, faceUpCardIds]);
    await db.none(Sql.ASSIGN_CARDS, [userId, `player${seat}FaceDowns`, gameId, faceDownCardIds]);

    console.log(`Cards assigned to player ${seat} successfully.`);
  } catch (error) {
    console.error(`Error assigning cards to player ${seat}: ${error.message}`);
    throw error;
  }
};


// Get game details, such as users in the game and who has what cards
const getGame = async (gameId) => {
  try {
    const [game, users, cards] = await Promise.all([
      db.one(Sql.GET_GAME, [gameId]),
      db.any(Sql.GET_USERS, [gameId]),
      db.any(Sql.GET_CARDS, [gameId]),
    ]);

    const userData = users.map((user) => ({
      ...user,
      cards: cards.filter((card) => card.user_id === user.id),
      cardCount: cards.filter((card) => card.user_id === user.id).length,
    }));

    return {
      ...game,
      users: userData,
    };
  } catch (error) {
    console.error(`Error fetching game details: ${error.message}`);
    throw error;
  }
};

// Get available games that I am not already in, that have at least 1 open slot
const getAvailableGames = async (user_id, game_id_start = 0, limit = 20, offset = 0) => {
  try {
    const games = await db.any(Sql.GET_AVAILABLE, {
      user_id,
      game_id_start,
      limit,
      offset,
    });

    return games;
  } catch (error) {
    console.error(`Error fetching available games: ${error.message}`);
    throw error;
  }
};

// Get games that I am already in, so if I leave I can rejoin
const getMyGames = async (user_id) => {
  try {
    const games = await db.any(Sql.GET_MY_GAMES, { user_id });
    return games;
  } catch (error) {
    console.error(`Error fetching my games: ${error.message}`);
    throw error;
  }
};

// Get games that are full, that I am not in, so I can watch them play
const spectateGames = async (user_id) => {
  try {
    const games = await db.any(Sql.GET_SPECTATE_GAMES, { user_id });
    return games;
  } catch (error) {
    console.error(`Error fetching spectate games: ${error.message}`);
    throw error;
  }
};

// Order of functions used to let the player that joins the game be assigned what they need to have
// Used in backend/routes/games/index.js
const joinGame = async (gameId, userId) => {
  try {
    await db.none(Sql.IS_PLAYER_IN_GAME, [gameId, userId]);
    await db.none(Sql.ADD_PLAYER, [gameId, userId, 2]);
    await assignCardsToPlayer(gameId, 2, userId);
  } catch (error) {
    console.error(`Error joining game: ${error.message}`);
    throw error;
  }
};

// Export all functions
export default {
  create,
  getGame,
  getAvailableGames,
  getMyGames,
  spectateGames,
  joinGame,
};