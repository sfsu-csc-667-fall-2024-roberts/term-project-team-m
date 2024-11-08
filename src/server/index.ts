import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import httpErrors from "http-errors";
import morgan from "morgan";
import * as path from "path";

import rootRoutes from "./routes/root";

dotenv.config();

import * as configuration from "./config";
import * as middleware from "./middleware";
import * as routes from "./routes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(process.cwd(), "src", "public")));
app.use(express.static(staticPath));

app.use(cookieParser());
app.set("views", path.join(process.cwd(), "src", "server", "views"));
app.set("view engine", "ejs");

app.use("/", rootRoutes);
app.use("/lobby", middleware.authentication, routes.mainLobby);
app.use("/account", routes.account);
app.use("/games", middleware.authentication, routes.games);

app.use((_request, _response, next) => {
    next(httpErrors(404));
});

app.listen(PORT, () => {
    console.log('Server is running on port ${PORT}');
});

