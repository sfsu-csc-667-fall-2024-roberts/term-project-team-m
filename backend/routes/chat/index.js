import express from "express";
import { createHash } from "crypto";
import db from "../../db/connection.js" // Import database connection details from the db folder
import { io } from '../../server.js'; // Import the socket io from server.js

const router = express.Router();

// Route used to submit a message to the database table
router.post('/submit-message', async (request, response) => {
    const { message } = request.body; // Get the message from the request form
    const { email } = request.session.user; // Get the email of the currently logged in user

    // If they entered a message, and they have a retrieved email
    if (message && message.trim().length > 0 && email) {

        // Cut off what is after the @ part of their email and use that first part as a "username"
        const username = email.slice(0, email.indexOf('@'));

        try {
            // Save message to PostgreSQL database table
            const result = await db.query(
                "INSERT INTO lobby_chatlog (username, message) VALUES ($1, $2) RETURNING id, username, message, timestamp",
                [username, message]
            );

            // Debugging statements to see if it was inserting correctly.
            /*
            console.log(result);
            console.log(result[0].id)
            console.log(result[0].username);
            console.log(result[0].message);
            console.log(result[0].timestamp)
            */

            // Check if insertion was successful
            if (result && result.length > 0) {
                const savedMessage = result[0];

                // Emit the message to all clients if it was
                io.emit("chat:message", {
                    hash: createHash("sha256").update(username).digest("hex"),
                    username: savedMessage.username,
                    message: savedMessage.message,
                    timestamp: savedMessage.timestamp
                });

                // If successfully sent, respond with success
                response.status(200).send('Message sent');

            } else {
                console.error("No data returned from database insert (probably wasn't inserted)", error);
                response.status(500).send("No data returned from database insert (probably wasn't inserted)");
            }
        } catch (error) {
            console.error("Error saving message to database:", error);
            response.status(500).send("Error saving message to database");
        }
    } else {
        // If it didn't send, send a different response
        response.status(400).send('Message cannot be empty, or you are not logged in');
    }
});

// Handle GET request to fetch messages from the lobby_chatlog database table
router.get('/fetch-messages', async (request, response) => {
    //console.log("Inside fetch messages in index.js...");
    try {
        const result = await db.query(
            "SELECT username, message, timestamp FROM lobby_chatlog ORDER BY timestamp"
        );
        //console.log(result); // Debugging statement
        response.json(result);
    } catch (error) {
        console.error('Error fetching messages:', error);
        response.status(500).send('Error fetching messages');
    }
});

export default router;
