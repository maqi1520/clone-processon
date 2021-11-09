import express from "express";
import prisma from "../prisma";
import { protect, Req } from "../middleware/auth";

const userRouter = express.Router();
userRouter.get("/", protect, async (req, res) => {
  const data = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  });
  const total = await prisma.user.count();
  res.json({
    data,
    total,
  });
});

userRouter.get("/me", protect, async (req: Req, res, next) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.clearCookie("token");
    next({
      message: "You need to be logged in to visit this route",
      statusCode: 401,
    });
  }
});

export default userRouter;
