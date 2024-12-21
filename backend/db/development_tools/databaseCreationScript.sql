/* Early Script to set up the database locally to work on the website */

-- Drop existing tables if they exist
DROP TABLE IF EXISTS Chat_Messages;
DROP TABLE IF EXISTS User_Cards;
DROP TABLE IF EXISTS Game_Cards;
DROP TABLE IF EXISTS Game_Users;
DROP TABLE IF EXISTS Standard_Deck_Cards;
DROP TABLE IF EXISTS Games;
DROP TABLE IF EXISTS Users;

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(256) UNIQUE NOT NULL, -- Store their email here, should be unique according to professor
    password VARCHAR(60) NOT NULL, -- Their password, should be encrypted before being stored here
    username VARCHAR(64) UNIQUE, -- Their username (display name)
    salt VARCHAR(255), -- Apparently used to help encrypt
    profileImage VARCHAR(255), -- Possibly store their profile image here
    created_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp, -- When did this user register
    modified_at TIMESTAMP WITH TIME ZONE, -- Could be used to check when they last changed something like profile pic or username
    gravatar VARCHAR(100) -- Apparently used by registration to generate an avatar based on your email address
);

CREATE TABLE Games (
    id SERIAL PRIMARY KEY,
    game_socket_id VARCHAR(255), -- The socket this game is running on
    created_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp NOT NULL, -- Game was created by the host at this time
    playersAllowed int, -- Max number of players allowed?
    gamePassword varchar(100), -- Password storage for possible private games
    creator_id INTEGER REFERENCES Users(id), -- Could be used to keep track of who created this game
    description varchar(100) DEFAULT 'No Description', -- Used by the existing create game page to store game description
    active BOOLEAN, -- Is the game still going?
    currentTurnPlayer INTEGER REFERENCES Users(id), -- Keeps track of the ID of the player whose turn it is
    gameName VARCHAR(255), -- Name of the game, to be displayed on the list of active games
    modified_at TIMESTAMP WITH TIME ZONE, -- Game was last modified (?? Like when a player joins?)
    started_at TIMESTAMP WITH TIME ZONE -- Game is passed the waiting stage for more players to join or prepare and the host started it at this time
);

CREATE TABLE Game_Users (
    user_id INTEGER REFERENCES Users(id),
    game_id INTEGER REFERENCES Games(id),
    seat INTEGER, -- This was specified in the migration, I assume this means where the player is displayed on the UI
    turnNumber INTEGER, -- How many turns have they had in this game? Not really necessary but it was in the example
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp, -- Joined the game at this time
    left_at TIMESTAMP WITH TIME ZONE -- Left the game at this time
);


CREATE TABLE Standard_Deck_Cards(
    id SERIAL PRIMARY KEY,
    suit INTEGER, -- Suit of the card, doesn't affect gameplay but does matter if we want to display it in the UI
    value INTEGER, -- Value of the card, ie "2, 3, 4, 5, 6, 7, 8, 9, 10, 11(J), 12(Q), 13(K), 14(A)",
    specialCard BOOLEAN -- Not sure if this is necessary since code will check based on card value but having it here for potential use
);

CREATE TABLE Game_Cards(
    user_id INTEGER REFERENCES Users(id),
    game_id INTEGER REFERENCES Games(id),
    card_id INTEGER REFERENCES Standard_Deck_Cards(id),
    card_Order int -- Can be used to keep track of where this card is in the shuffled deck, or in a player's hand
);

CREATE TABLE User_Cards(
    card_id INTEGER REFERENCES Standard_Deck_Cards(id),
    user_id INTEGER REFERENCES Users(id),
    card_Order int, -- Potentially used to keep track of where this card is in the player hand
    cardLocation varchar(64), -- Used to keep track of if the card is in the player hand, faceups, or facedowns
    drawn_at TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp -- When this card was added to the player hand
);

CREATE TABLE Chat_Messages(
    user_id INTEGER REFERENCES Users(id),
    game_id INTEGER REFERENCES Games(id),
    content varchar(255), -- The message itself
    created_at TIMESTAMP WITH TIME ZONE -- When this message was added to the table
);

-- _________________________________________________________________________________________________________________________________________________________

