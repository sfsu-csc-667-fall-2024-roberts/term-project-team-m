import cookieParser from "cookie-parser";
import "dotenv/config.js";
import express from "express";
import createError from "http-errors";
import morgan from "morgan";
import * as path from "path";

import * as configure from "./config/index.js";
import * as middleware from "./middleware/index.js";
import * as routes from "./routes/index.js";

// New imports used to fix the below error
// TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string. Received undefined
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Imports for socket.io
//import http from "http"; 
import { Server as SocketIOServer } from "socket.io"; 

// Note that this path omits "backend" - server is running in the backend directory
// so BACKEND_PATH is PROJECT_ROOT/backend
const BACKEND_PATH = import.meta.dirname;

// The original lines provided in the starter code that do not work on my Windows system
//const STATIC_PATH = path.join(BACKEND_PATH, "static");
//const VIEW_PATH = path.join(BACKEND_PATH, "routes");

// Alternative method that works on my local Windows machine, seems to be needed because starter code is using imports / modules instead of "requires"
/**/
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const STATIC_PATH = join(__dirname, "static");
const VIEW_PATH = join(__dirname, "routes");

// ____________________________________________________________________________
// Create the application server and being listening on the given port or 3000
const PORT = process.env.PORT || 3000;

const app = express();
const expressServer = app.listen(PORT, () => {
  console.log(
    `Server started on port ${PORT}, in the ${process.env.NODE_ENV ?? "production"} environment`,
  );
});

const io = new SocketIOServer(expressServer, {
  cors:{
    // If on production, don't allow others to access the server (according to documentation this seems to be how it's set up)
    // But if it's in development, then allow localhost (localhost or the actual localhost ip 127.0.0.1) to access it
    origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:3000", "http://127.0.0.1:3000"]
  }
})

// __________________________________________
io.on('connection', (socket) => {
  console.log(`User ${socket.id} connected`);

  // ___________________________________________________
  // Setting up placeholder event handlers for socket

  // When a user joins the lobby, log it to console so I can see that this event triggered
  socket.on('joinLobby', () => {
    socket.join('lobby');
    console.log(`User ${socket.id} joined the lobby`);
  });

  // When someone joins a game, emit a message that they joined and also console it so I can see this event triggered
  socket.on('joinGame', ({ userId, gameId }) => {
    socket.join(gameId);
    console.log(`User ${userId} joined game ${gameId}`);
    socket.to(gameId).emit('message', `User ${userId} joined the game`);
  });

  // When someone plays a card, console it so I can see this event triggered and then emit that a card was played by a user
  socket.on('playCard', ({ userId, gameId, card }) => {
    // 
    console.log(`User ${userId} played card ${card} in game ${gameId}`);
    io.to(gameId).emit('cardPlayed', { userId, card });
  });

  // When someone sends a message, check where it was sent from,
  // Console log a message so I can see that this event triggered and where it was from
  // Then emit a message in the room that it came from
  socket.on('message', ({ userId, gameId, message }) => {
    console.log(`User ${userId} sent message in ${gameId ? `game ${gameId}` : 'lobby'}: ${message}`);
    if (gameId) {
      io.to(gameId).emit('message', { userId, message });
    } else {
      io.to('lobby').emit('message', { userId, message });
    }
  });

  // When a 'trigger-refresh' event happens, emit to refresh the page
  socket.on('trigger-refresh', () => {
    io.emit('refresh-page');
  });

  // When someone disconnects from the socket, log a message so I can see it
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
});

/// ----  CRITICAL -----
// Export io so it can be accessed by other files in this project
// Also set it too so I can use that method
export { io };
app.set("io", io);


// ____________________________________________________________________________


// ____________________________________________________________________________
app.use(middleware.menuItemsDefault);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(configure.session());

configure.liveReload(app, STATIC_PATH);
configure.views(app, VIEW_PATH, STATIC_PATH);

app.use("/", routes.home);
app.use("/auth", routes.auth);

app.use(middleware.isAuthenticated);
app.use(middleware.menuItemsAuthenticated);
app.use("/lobby", routes.lobby);
app.use("/games", routes.games);
app.use("/test", routes.test); // Add the test page route from the index.js there
app.use("/chat", routes.chat); // Import chat route(s) from the index.js there
app.use("/moreRoutes", routes.moreRoutes); // Import additonal route(s) from the file there because they didn't work right when directly in the games one

app.use(express.static(path.join(__dirname, 'public')));

app.use((_request, _response, next) => {
  return next(createError(404));
});