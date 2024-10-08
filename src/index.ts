import express from "express";
import path from "path";

import morgan from "morgan";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/errorHandler";
import auth from "./controllers/auth";
import user from "./controllers/user";
import github from "./controllers/github";
import diagraming from "./controllers/diagraming";
require("dotenv").config();
const app = express();

app.use(cookieParser());
app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded());

app.use(express.static(path.join(__dirname, "../public")));
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");

app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/github", github);
app.use("/diagraming", diagraming);

app.get("/view/:id", function (req, res) {
  return res.render("view", {
    chartId: req.params.id,
  });
});

app.get("/embed/:id", function (req, res) {
  return res.render("embed", {
    chartId: req.params.id,
  });
});

app.get("/", function (req, res) {
  return res.render("index", {});
});

app.get("/login", function (req, res) {
  return res.render("login", {});
});

app.get("/register", function (req, res) {
  return res.render("register", {});
});

app.get("*", function (req, res) {
  res.status(404).send("Sorry, cant find that");
});

app.use(errorHandler);

const port = process.env.PORT || 3000;

app.listen(port, () =>
  console.log(`🚀 Server ready at: http://localhost:${port}`)
);
export { app };
