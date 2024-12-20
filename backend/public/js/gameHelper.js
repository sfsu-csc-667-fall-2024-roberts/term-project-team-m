// I can't import here, because it says Uncaught SyntaxError: import declarations may only appear at top level of a module

const socket = io();

socket.on('refresh-page', () => {
    location.reload();
});

// Global variable to keep track of who is making these requests
let loggedInUserID;

// Function to find out who is making requests and set the global variable above to the found user id
async function getUserId() {
    try {
        const response = await fetch('/auth/whoIsAsking');
        const data = await response.json();
        console.log("Found whoIsAsking as ID:", data);
        if (data) {
            loggedInUserID = parseInt(data);
            return loggedInUserID; // Return the user ID
        } else {
            console.log("There was no userId in the data");
            return null;
        }
    } catch (error) {
        console.error('Error fetching user ID:', error);
        return null;
    }
}


// Print the data that is given to the ejs file to render
console.log("Inside of gameHelper.js file.....");
console.log("GameID is " + gameID);
console.log("Description is " + description);
//console.log("users is: " + users);
//console.log("Users[0] id and seat is " + "ID: " + users[0].id + ", SEAT: " + users[0].seat);
//console.log("Users[1] id and seat is " + "ID: " + users[1].id + ", SEAT: " + users[1].seat);
// console.log("Player1Hand is:" + player1Hand);
// console.log("Player1FaceUps is: " + player1FaceUps);
// console.log("Player1FaceDowns is: " + player1FaceDowns);
// console.log("Player2Hand is: " + player2Hand);
// console.log("Player2FaceUps is: " + player2FaceUps);
// console.log("Player2FaceDowns is: " + player2FaceDowns);
//console.log("Drawing deck is " + drawingDeck);
console.log("PlayingPile is: " + playingPile);
console.log("Pile Value is: " + pileValue);
console.log("GameTurn is " + gameTurn);


// Function used to send post requests to various different endpoints based on the input URL using the body parameters
function sendPostRequest(url, body) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: body
    })
        .then(response => {
            // This only happens when you try to play someone else's card
            if (response.status == 111) {
                return false;

            }
            if (response.ok) {
                // Let me know it was successful
                console.log('Finished a post request..');
                return true;

            } else {
                response.json().then(data => {
                    // Let me know it had an error
                    console.error('Error:', data.message);
                });
            }
        })
        .catch(error => {
            // Catch any errors that occur anywhere and let me know what happened
            console.error('Error:', error);
        });
    return true;

}


// Revised getUserHand to handle the case when those parts are empty
function getUserHand(userId) {
    if (player1Hand && player1Hand.length > 0 && player1Hand[0].user_id == userId) {
        return [player1Hand, "player1Hand"];
    } else if (player2Hand && player2Hand.length > 0 && player2Hand[0].user_id == userId) {
        return [player2Hand, "player2Hand"];
        // } else if (player3Hand && player3Hand.length > 0 && player3Hand[0].user_id == userId) {
        //     return [player3Hand, "player3Hand"];
        // } else if (player4Hand && player4Hand.length > 0 && player4Hand[0].user_id == userId) {
        //     return [player4Hand, "player4Hand"];
    }

    return null; // Return null if user's hand is not found
}

// Function that takes a card from the drawingDeck and assigns it to a player
function drawCardFromDrawDeck(userId) {
    // This function will query the database for the first card it finds that is in location "drawingDeck"
    // Then it will give it to a specific player's hand
    // var drawnCard = drawingDeck[0];
    // getUserId()
    // drawnCard.location = 'player1Hand'
    // drawnCard.user_id = 1
    // "UPDATE game_cards SET user_id=$1, location=$2 WHERE game_id=$3 AND id = ANY($4::int[])",
    // 
    //    const requestData = {
    //         cardUpdate: drawnCard,
    //    }
    console.log('Drawing a card from the draw deck...');

    console.log('---------------------------------------------')

    console.log("DRAWED NEW Card:", drawingDeck[0]);
    console.log('---------------------------------------------')
    let url = '/games/draw/' + gameID;

    let result = getUserHand(userId);
    let hand = result[0];
    let location = result[1];
    // console.log(hand, location)

    // If hand has three or more cards, don't draw
    if (hand.length > 3) {
        return;
    }

    // If they need to draw, then send a post request to draw a card
    let body = JSON.stringify({
        game_id: gameID,
        location: location,
        card_id: drawingDeck[0].id,
    });

    // Send a post request to the draw route
    sendPostRequest(url, body);
}



function pickUpPlayingPile() {
    // When the playing pile is clicked, this function triggers.

    // First off, check if there are at least two players in the game
    if (users.length < 2) {
        alert("You can't pick up the pile because there are not enough players in the game for it to start!");
        return;
    }

    // Check if the playingPile actually has anything in it
    if (playingPile.length < 1) {
        alert("You can't pick up the pile because there is nothing in it!");
        return;
    }

    // If there are at least 2 players then check if the person who triggered this (viewer) is in the game
    if (viewerUserID !== users[0].id && viewerUserID !== users[1].id) {
        alert("You can't do that, you're not in this game!");
        return;
    }

    //alert("You clicked on the playing pile! All the cards in it have been added to your hand!");

    // This function would then query the database for all cards in this game_id where location is "playingPile"
    // Then for those, change theiri userID from null to the user who clicked on it, and the location to the hand of the user who clicked on it
    // var PlayingPile = playingPile;
    // drawnCard.location = 'player1Hand'
    // drawnCard.user_id = 1
    // "UPDATE game_cards SET user_id=$1, location=$2 WHERE game_id=$3 AND id = ANY($4::int[])",
    // 
    //    const requestData = {
    //         cardUpdate: drawnCard,
    //    }
    console.log('---------------------------------------------')
    console.log(playingPile)
    console.log('---------------------------------------------')
    let url = '/games/pile/' + gameID; // Prepare url to send a request to the pile route which will handle this
    let cardIds = playingPile.flatMap((card) => card.id); // Map card id's from the playing pile into a flat map so it can be sent into the request
    console.log("Card ID's of cards in the pile are: " + cardIds);

    let locationToSend;

    // Check whose turn it is and if the viewer is the current player
    // If this game is currently on player 1's turn
    if (gameTurn === 1) {
        // Check that the person who triggered this is player 1
        if (viewerUserID === users[0].id) {
            // Player 1's turn and viewer is player 1
            // Then set the location to send to player1Hand so it goes to their hand
            locationToSend = 'player1Hand';
        } else {
            // If it wasn't player 1's turn
            alert("It is not your turn so you cannot pick up the pile");
            return;
        }

        // If this game is currently on player 2's turn
    } else if (gameTurn === 2) {
        // Check that the person who triggered this is player 2
        if (viewerUserID === users[1].id) {
            // Player 2's turn and viewer is player 2
            // Then set the location to send to player2Hand so it goes to their hand
            locationToSend = 'player2Hand';
        } else {
            // If it wasn't player 2's turn
            alert("It is not your turn so you cannot pick up the pile");
            return;
        }
    }

    let body = JSON.stringify({
        game_id: gameID,
        location: locationToSend,
        card_ids: cardIds,
    });
    // Send a post request to the route in order to have it place the pile cards in their hand
    sendPostRequest(url, body);

    // Send a post request to the route that should change the player turn for this game so it advances player turn
    // (Picking up the pile forfeits your turn)
    fetch('/games/advancePlayerTurn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ game_id: gameID }),
    })
        .then(response => {
            if (response.ok) {
                console.log("Successfully changed the player turn of this game.");
                //window.location.href = `/games/${gameID}`;
                // Then trigger a page refresh
                triggerPageRefresh();
            } else {
                console.error('Failed to change player turn');
            }
        })
        .catch(error => {
            console.error('Error changing player turn:', error);
        });
}

// Function called when someone plays a 10, which will destroy the pile and they will get to go again
function playSpecialCardTen(cardIdOfTheTen, user_id) {
    console.log('---------------------------------------------')

    // Add the ten card id to the playingPile
    playingPile.push({ id: cardIdOfTheTen }); // Add the ten to the playing pile so it isn't still there after this runs
    console.log("Playing pile in specialCardTen function" + playingPile);
    console.log('---------------------------------------------')

    let url = '/games/pile/' + gameID; // Prepare url to send a request to the pile route which will handle this
    let cardIds = playingPile.flatMap((card) => card.id); // Map card id's from the playing pile into a flat map so it can be sent into the request
    console.log("Card ID's of cards in the pile are: " + cardIds);

    let locationToSend = "discarded";

    let body = JSON.stringify({
        game_id: gameID,
        location: locationToSend,
        card_ids: cardIds,
    });
    // Send a post request to the route in order to have it place the pile cards in their hand
    sendPostRequest(url, body);

    // 10 does not advance the player turn, they get to go again, so don't advance the turn.
    // But they will need a new card
    if (drawingDeck.length > 0) {
        drawCardFromDrawDeck(user_id);
    }
}


// Function called when someone plays a facedown, which will play the card even if it doesn't beat the pile...
// If it doesn't beat the pile value, then it will add the entire pile to your hand
// If it does... then continue as normal
function playFaceDownCard(wasValidPlay, cardIdOfTheFaceDown) {

    if (wasValidPlay) {
        // If it was a valid move, no special things are needed, so exit this function:
        return;
    }

    else {
        console.log('---------------------------------------------')
        // Add the faceDown card id to the playingPile
        playingPile.push({ id: cardIdOfTheFaceDown }); // Add the ten to the playing pile so it isn't still there after this runs
        console.log("Playing facedown in playFaceDownCard" + playingPile);
        console.log('---------------------------------------------')

        let url = '/games/pile/' + gameID; // Prepare url to send a request to the pile route which will handle this
        let cardIds = playingPile.flatMap((card) => card.id); // Map card id's from the playing pile into a flat map so it can be sent into the request
        console.log("Card ID's of cards in the pile are: " + cardIds);

        let locationToSend;

        // Check whose turn it is and if the viewer is the current player
        // If this game is currently on player 1's turn
        if (gameTurn === 1) {
            // Send to player1Hand
            locationToSend = 'player1Hand';
        }
        // If this game is currently on player 2's turn
        else if (gameTurn === 2) {
            // Then set the location to send to player2Hand so it goes to their hand
            locationToSend = 'player2Hand';
        }

        // Then formulate the request for them to pick up the pile
        let body = JSON.stringify({
            game_id: gameID,
            location: locationToSend,
            card_ids: cardIds,
        });
        
        // Send a post request to the route in order to have it place the pile cards in their hand
        sendPostRequest(url, body);

        alert("Yikes! Your facedown card was not good enough to beat the pile value and you've had to pick it up!");

        // Send a post request to the route that should change the player turn for this game so it advances player turn
        // (Picking up the pile forfeits your turn)
        fetch('/games/advancePlayerTurn', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ game_id: gameID }),
        })
            .then(response => {
                if (response.ok) {
                    console.log("Successfully changed the player turn of this game.");
                    //window.location.href = `/games/${gameID}`;
                    // Then trigger a page refresh
                    triggerPageRefresh();
                } else {
                    console.error('Failed to change player turn');
                }
            })
            .catch(error => {
                console.error('Error changing player turn:', error);
            });

    }

}




// Test function to see if I can get drawing deck to say something when clicked
function handleDrawingDeckClick() {
    alert("You clicked on the drawing deck! Cards are dealt automatically so this is unnecessary.");
    // drawCardFromDrawDeck()
}


// Function used to check if the clicked card beats the current pile value according to the rules of Shithead.
async function checkIfValidPlay(clickedCardID) {

    // This will need to find that card in the database, and get its card Name
    // It will also need to query the games table for that game and get its pileValue

    try {
        const response = await fetch(`/moreRoutes/getGamePileValue?cardID=${clickedCardID}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`VALID PLAY SAYS RESPONSE NOT OK! Status: ${response.status}`);
        }

        // If response was ok, parse the response for use here
        const data = await response.json();
        console.log("Data retrieved from checkIfValidPlay fetch request");
        console.log('Card Name:', data.card_name);
        console.log('Card Value:', data.card_value);
        console.log('Found Game ID:', data.game_id);
        console.log('Game Pile Value:', data.game_pile_value);
        console.log('Card Location: ', data.location);

        // Save the current pile value from the response, for use in the switch
        const currentPileValue = parseInt(data.game_pile_value);
        const cardToPlay = parseInt(data.card_value);

        // 2, 8, and 10 are special cards that can be played on anything
        if (cardToPlay == 2 || cardToPlay == 8 || cardToPlay == 10) {
            return true;
        }

        // For anything else, it will need to be checked against the pile value
        switch (currentPileValue) {
            case 0:
            case 2:
            case 3:
                return true; // All cards can be played on an empty pile, a 2 or a 3
            case 4:
                return cardToPlay !== 3; // Allow all cards except 3 for pile value 4
            case 5:
                return cardToPlay !== 3 && cardToPlay !== 4; // Allow all cards except 3 and 4 for pile value 5
            case 6:
                return cardToPlay !== 3 && cardToPlay !== 4 && cardToPlay !== 5; // Allow all cards except 3, 4, and 5 for pile value 6
            case 7:
                return cardToPlay !== 3 && cardToPlay !== 4 && cardToPlay !== 5 && cardToPlay !== 6; // Allow all cards except 3, 4, 5, and 6 for pile value 7
            case 8:
                return cardToPlay !== 3 && cardToPlay !== 4 && cardToPlay !== 5 && cardToPlay !== 6 && cardToPlay !== 7; // Allow all cards except 3, 4, 5, 6, and 7 for pile value 8
            case 10: // This shouldn't happen once I'm done, but for the sake of development, have this as true (normally 10 will wipe the pile)
                return true;
            case 9:
                // Display a custom alert message in case they are unfamiliar with how to beat a 9
                if ([11, 12, 13, 14].includes(cardToPlay)) {
                    alert("A pile value of 9 requires a card to be 9 or lower to beat it");
                }
                return ![11, 12, 13, 14].includes(cardToPlay); // Allow all cards except J, Q, K, and A for pile value 9
            case 11:
                return [11, 12, 13, 14].includes(cardToPlay); // Allow J, Q, K, and A for pile value 11 (J)
            case 12:
                return [12, 13, 14].includes(cardToPlay); // Allow Q, K, and A for pile value 12 (Q)
            case 13:
                return [13, 14].includes(cardToPlay); // Allow K and A for pile value 13 (K)
            case 14:
                return cardToPlay == 14; // Allow only A for pile value 14 (A)
            default:
                return false; // Default case, invalid play, this should only happen if they try and edit the page
        }

    } catch (error) {
        console.error('Error checking if valid play:', error);
        return false;
    }
}



// When a card is clicked, do this...
async function handleCardClick(location, clickedCardID, cardName, user_id) {
    // First off, check if there are at least two players in the game
    if (users.length < 2) {
        alert("The game hasn't started yet! You can't play a card yet.");
        console.log("Game has not started yet, you can't play cards yet.");
        return;
    }

    //alert(`You clicked on cardID ${id} in ${location} which is a ${cardName}!`); // Commented out for now so it doesn't reveal hidden card values
    //alert(`You clicked on cardID ${clickedCardID} in ${location} which belongs to userID ${user_id}`);
    let convertedClickedCardID = Number(clickedCardID);

    // console.log('---------------------------------------------')
    // console.log(convertedClickedCardID, typeof(convertedClickedCardID), user_id)
    // console.log('Inside handle card click, just before getting user hand')
    // console.log(getUserHand(user_id))
    // console.log('---------------------------------------------')

    // Store a copy of the game's current player turn value
    var currentPlayerTurn = gameTurn;

    // Get who clicked this card
    let whosAsking = await getUserId();
    console.log("whosAsking returned " + whosAsking);
    let integeredUserID = parseInt(user_id);
    console.log("Integered userID is: " + integeredUserID);

    // ---------------------------------------------------------------------
    // Whole bunch of checks to make sure they are playing their own card, and they are allowed to play the one they clicked on
    // ---------------------------------------------------------------------
    // Player 1 location checking, if the card clicked was one of the ones in player 1 section
    if (location === "player1Hand" || location === "player1FaceUps" || location === "player1FaceDowns") {
        if (currentPlayerTurn !== 1 || whosAsking !== integeredUserID) {
            // If it wasn't player 1 that clicked a player 1 card
            if (whosAsking !== integeredUserID) {
                console.log("That is not your card, you cannot play it");
                alert("That is not your card, you cannot play it");
            } else {
                // If it was player 1 that clicked the card, but it wasn't their turn in the game
                alert("It is not your turn");
                console.log("It is not your turn");
            }
            return; // exit this function
        }
        // If they tried to play a face up before hand was empty
        else if (location === "player1FaceUps" && player1Hand && player1Hand.length > 0) {
            console.log("You can't play face-up cards until your hand is empty!")
            alert("You cannot play your face-up cards until your hand is empty!");
            return; // Exit this function
        }
        // If they tried to play a facedown before hand and faceups were gone
        else if (location === "player1FaceDowns" && (player1Hand && player1Hand.length > 0 || player1FaceUps && player1FaceUps.length > 0)) {
            console.log("You can't play face-down cards until you played all cards in your hand and your face-ups");
            alert("You can't play face-down cards until you played all cards in your hand and your face-ups");
            return; // exit this function
        }
        // ---------------------------------------------------------------------
        // Checks for player 2 locations
    } else if (location === "player2Hand" || location === "player2FaceUps" || location === "player2FaceDowns") {
        if (currentPlayerTurn !== 2 || whosAsking !== integeredUserID) {
            // If it wasn't player 2 that clicked a player 2 card...
            if (whosAsking !== integeredUserID) {
                console.log("That is not your card, you cannot play it");
                alert("That is not your card, you cannot play it");
            } else {
                // If it was player 2 that clicked the card, but it wasn't their turn in the game
                alert("It is not your turn");
                console.log("It is not your turn");
            }
            return; // exit this function
        }
        // If they tried to play a face up before hand was empty
        else if (location === "player2FaceUps" && player2Hand && player2Hand.length > 0) {
            console.log("You can't play face-up cards until your hand is empty!")
            alert("You cannot play your face-up cards until your hand is empty!");
            return; // Exit this function
        }
        // If they tried to play a facedown before hand and faceups were gone
        else if (location === "player2FaceDowns" && (player2Hand && player2Hand.length > 0 || player2FaceUps && player2FaceUps.length > 0)) {
            console.log("You can't play face-down cards until you played all cards in your hand and your face-ups");
            alert("You can't play face-down cards until you played all cards in your hand and your face-ups");
            return; // exit this function
        }
    } else {
        // If it was somehow not in any of those locations, reject it by default
        console.log("Card was not in player 1 or player 2 card locations, thus, rejecting an attempt to play this.");
        return;
    }
    // ---------------------------------------------------------------------

    // ---------------------------------------------------------------------
    // Only try and make the valid play checks if they were allowed to play the card they clicked on
    try {
        console.log("Inside card click handler Try/Catch block");
        // Run a check to see if it was a valid play, takes the clicked card's ID number
        // and checks if it beats the pile value according to the rules
        let isValidPlay = await checkIfValidPlay(convertedClickedCardID);

        // Used later
        const response = await fetch(`/moreRoutes/getGamePileValue?cardID=${convertedClickedCardID}`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`VALID PLAY SAYS RESPONSE NOT OK! Status: ${response.status}`);
        }

        // If this was a facedown card, this is a special case
        if ((location === "player1FaceDowns" || location === "player2FaceDowns") && !isValidPlay) {
            console.log("Facedown play detected!");
            // Call the special function to check if they need to have the pile added to their hand!
            // If it was a valid play, nothing will happen, otherwise... they get a whole pile!
                console.log("Handling non-valid play facedown event inside handle card click...");
                playFaceDownCard(isValidPlay, convertedClickedCardID);
                return;
        }


        // Only proceed if it's a valid play
        if (isValidPlay) {
            console.log("Inside check if valid play was true");

            // ------------------------------------------
            // Formulate url and body for POST request to server to play a card to the pile
            let url = '/games/play/' + gameID;
            // let cardIds = playingPile.flatMap((card) => card.id);
            // console.log(cardIds)

            let body = JSON.stringify({
                game_id: gameID, // Send this game ID
                location: 'playingPile', // The card will be put into the playingPile location
                card_id: convertedClickedCardID, // Send the cardID of the clicked on card
                card_owner_id: user_id, // Send the ID of the user who made this request, used to check if it was the right player
            });

            // Now send a post request for playing a card
            sendPostRequest(url, body);
            // ------------------------------------------


            // Then draw a card
            if (drawingDeck.length > 0) {
                drawCardFromDrawDeck(user_id);
            }


            // If response was ok, parse the response for use here
            const data = await response.json();
            console.log("Data retrieved from getGamePileValue fetch request");
            //console.log('Card Name:', data.card_name);
            const cardTheyPlayed = data.card_value;
            console.log('Card Value:', data.card_value);
            //console.log('Found Game ID:', data.game_id);
            //console.log('Game Pile Value:', data.game_pile_value);

            // If they played a ten run the special function for it and dont advance turn, since 10 lets you go again
            if (cardTheyPlayed == 10) {
                playSpecialCardTen(convertedClickedCardID, user_id);
                checkWin();
                setTimeout(function () {
                    triggerPageRefresh(); // Call triggerPageRefresh() after a delay to see if it fixes the issue
                }, 200); // 200 milliseconds delay (0.2 seconds)
            } else {
                checkWin();
                // If the played card was not a 10, proceed as normal
                // Send a post request to the route that should change the player turn for this game
                fetch('/games/advancePlayerTurn', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ game_id: gameID }),
                })
                    .then(response => {
                        if (response.ok) {
                            console.log("Successfully changed the player turn of this game.");
                            // Refresh the page at the end of a valid play
                            setTimeout(function () {
                                triggerPageRefresh(); // Call triggerPageRefresh() after a delay to see if it fixes the issue
                            }, 200); // 200 milliseconds delay (0.2 seconds)
                        } else {
                            console.error('Failed to change player turn');
                        }
                    })
                    .catch(error => {
                        console.error('Error changing player turn:', error);
                    });
            }

        } else { // IF NOT VALID PLAY
            // Inform the user that it's not a valid play
            console.log('Not a valid play');
            alert("That card does not beat the pile value")
        }

    } catch (error) {
        console.error('Error handling card click:', error);
    }
    // Call the function to see if this was the winning play
    checkWin();
    console.log("End of handle card click function");
}

// Function used to update what the playing pile on the page shows as the active card and value
function updatePlayingPileCard(value) {
    console.log("Inside updatePlayingPileCard function!!!!!!!!");
    console.log("||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||");
    const playingPileCard = document.getElementById('playingPileCard');
    console.log("After getting element by id: " + playingPileCard);
    if (playingPileCard) {
        let cardName = '';

        switch (value) {
            case 0:
                cardName = 'None';
                break;
            case 10:
                cardName = "None";
                break;
            case 11:
                cardName = 'Jack';
                break;
            case 12:
                cardName = 'Queen';
                break;
            case 13:
                cardName = 'King';
                break;
            case 14:
                cardName = 'Ace';
                break;
            default:
                cardName = value.toString();
        }
        // console.log("setting inner html to: " + "<span>Active Card: " + cardName + " " + value + "</span>");

        // Only show the value in parentheses if it's Jack, Queen, King, or Ace
        const displayValue = (value === 11 || value === 12 || value === 13 || value === 14) ? `${cardName} (${value})` : cardName;

        playingPileCard.innerHTML = `<span>Active Card: ${displayValue}</span>`;
        playingPileCard.innerHTML = `<span>${displayValue}</span>`;
    }
}

// Run this function so the pile value is shown
updatePlayingPileCard(pileValue);


// Function used to send a get request to the triggerRefresh route in games/index.js to try and get the socket to refresh the page
async function triggerPageRefresh() {
    try {
        console.log("Sending request to trigger refresh on the socket");

        // Send a POST request to the /triggerRefresh endpoint
        const response = await fetch('/games/triggerRefresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('Page refresh RESPONSE NOT OK:', response.statusText);
        } else {
            console.log('Page refresh event emitted successfully');
        }

    } catch (error) {
        console.error('Caught an error triggering page refresh:', error);
    }
}



// Function used to check if a player won the game
function checkWin() {
    if (users.length < 2) {
        // Don't check if anyone won until there are at least two players in the game
        return;
    } else {
        // Retrieve the winner notification element
        const bigHeaderWinDiv = document.getElementById("bigHeaderWin");

        // Get the Player 1 and Player 2 names from the data and cut off the email address
        const player1Name = users[0].email.substring(0, users[0].email.indexOf("@"));
        const player2Name = users[1].email.substring(0, users[1].email.indexOf("@"));


        // Check if player 1 won
        if (
            // If player 1's hand, faceUps and faceDowns are empty simeoultaneously, meaning they got rid of all cards, then that means they won.
            player1Hand.length === 0 &&
            player1FaceUps.length === 0 &&
            player1FaceDowns.length === 0
        ) {
            const player1WinDiv = document.getElementById("player1WinDetection");
            player1WinDiv.innerHTML = `<h3>${player1Name} has won and is NOT the shithead!</h3>`;
            bigHeaderWinDiv.innerHTML = `<h3>${player1Name} has won and is NOT the shithead!</h3>`;
            // Disable further interactions when a player wins
            document.getElementById("player1-hand").innerHTML = "";
            document.getElementById("player2-hand").innerHTML = "";
            alert(`WE HAVE A WINNER! It's ${player1Name}`);
        }

        // Check if player 2 won
        if (
            // If player 2's hand, faceUps and faceDowns are empty simeoultaneously, meaning they got rid of all cards, then that means they won.
            player2Hand.length === 0 &&
            player2FaceUps.length === 0 &&
            player2FaceDowns.length === 0
        ) {
            const player2WinDiv = document.getElementById("player2WinDetection");
            player2WinDiv.innerHTML = `<h3>${player2Name} has won and is NOT the shithead!</h3>`;
            bigHeaderWinDiv.innerHTML = `<h3>${player2Name} has won and is NOT the shithead!</h3>`;

            // Disable further interactions when a player wins
            document.getElementById("player1-hand").innerHTML = "";
            document.getElementById("player2-hand").innerHTML = "";
            alert(`WE HAVE A WINNER! It's" ${player2Name}!`);
        }
    }


}

// Call the check win on page reload
checkWin();