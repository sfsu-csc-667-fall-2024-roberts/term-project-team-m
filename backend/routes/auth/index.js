import express from "express";
import { Users } from "../../db/index.js";
import { checkPassword, encryptPassword } from "./password-handling.js";

const router = express.Router();

// Setup for the register and login and logout routes

router.get("/register", (_request, response) => {
  response.render("auth/register");
});

router.post("/register", async (request, response) => {
  const { password, email } = request.body;

  if (await Users.exists(email)) {
    // The user email already exists in our database
    response.redirect("/auth/login");
  } else {
    const encryptedPassword = await encryptPassword(password);

    request.session.user = await Users.create(email, encryptedPassword);
    response.redirect("/lobby");
  }
});

router.get("/login", (_request, response) => {
  response.render("auth/login");
});

router.post("/login", async (request, response) => {
  const { password, email } = request.body;

  try {
    if (await checkPassword(email, password)) {
      const user = await Users.find(email);
      request.session.user = {
        id: user.id,
        email: user.email,
        gravatar: user.gravatar,
      };

      response.redirect("/lobby");
    } else {
      throw "User not found";
    }
  } catch (error) {
    // If we were nice, we would add an error message of some sort
    response.redirect("/login");
  }
});

router.get("/logout", (request, response, next) => {
  request.session.user = null;
  request.session.save((error) => {
    if (error) {
      next(error);
    }

    request.session.regenerate((error) => {
      if (error) {
        next(error);
      }
      response.redirect("/");
    });
  });
});


// Used in the games area to find out who is making requests quickly
router.get('/whoIsAsking', (req, res) => {
  console.log("Inside whoIsAsking endpoint")

  if (req.session.user && req.session.user.id) {
    res.json(req.session.user.id);
  } else {
    res.status(401).json({ error: 'User not logged in' });
  }
});

export default router;
