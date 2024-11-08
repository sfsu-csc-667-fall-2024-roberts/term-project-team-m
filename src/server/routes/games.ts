import express from "express";

const router = express.Router();

router.get("/:id", (request, response) => {
  const { id } = request.params;

  response.render("games/game", { title: `Game ${id}`, id });
});

router.get("/:id/lobby", (request, response) => {
  const { id } = request.params;

  response.render("games/lobby", { title: "Game lobby", id });
});

export default router;

