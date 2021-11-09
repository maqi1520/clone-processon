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

app.use("/api/auth", auth);
app.use("/api/user", user);
app.use("/api/github", github);
app.use("/diagraming", diagraming);

app.use(errorHandler);

const server = app.listen(process.env.PORT || 3000, () =>
  console.log(`🚀 Server ready at: http://localhost:3000`)
);
