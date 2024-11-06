import express from "express";

const router = express.Router();

router.get("/", (_request, response) => {
    response.render("root", { title: "TEAM M Site", name: "John"});
});

export default router;
