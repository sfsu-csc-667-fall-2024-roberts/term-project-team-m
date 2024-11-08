import express from "express";

const router = express.Router();

router.get("/:id/account", (request, response) => {
  const { id } = request.params;

  response.render("home/account", { title: `Account ${id}`, id });
});


export default router;

