import express from "express";

const router = express.Router();

// This makes it so that the default url on server startup renders the homepage
// By default route I mean (http://localhost:3000/)
router.get("/", (request, response) => {
  response.render("home/home");
});

export default router;
