import express from "express";
import { Games } from "../../db/index.js";

const router = express.Router();

router.get("/", async (_request, response) => {
  const userId = _request.session.user.id;
  console.log("Request.user is: " + _request.user);

  try {
    const availableGames = await Games.getAvailableGames(userId);
    const myGames = await Games.getMyGames(userId);
    const spectateGames = await Games.spectateGames(userId);
    response.render("lobby/lobby", { 
      availableGames,
      myGames,
      spectateGames });
  } catch (error) {
    console.error(error);
    response.render("lobby/lobby", { availableGames: [] });
  }
});

export default router;
