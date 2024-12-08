import * as express from "express";
import * as fs from "fs";

const router = express.Router();
const dbPath = "./server/db.json";

router.post("/signup", (request, respond) => {
  const { name, email, password } = request.body;  // Updated to use 'name' and 'email'
  const users = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

  if (users[email]) {
    respond.status(400).send("User already exists!");
  } else {
    users[email] = { name, password };
    fs.writeFileSync(dbPath, JSON.stringify(users));
    respond.sendStatus(200);
  }
});

router.post("/login", (request, respond) => {
  const { email, password } = request.body;  // Updated to use 'email'
  const users = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

  if (users[email] && users[email].password === password) {
    respond.sendStatus(200);
  } else {
    respond.status(401).send("Invalid credentials!");
  }
});

export default router;
