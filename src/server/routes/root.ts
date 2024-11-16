import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
  response.render("root", {
    title: "TEAM M Site",
    name: "John",
  });
});

router.get("/lobby", (_request, response) => {
  response.render("lobby", {
    title: "TEAM M Site",
  });
});

export default router;
