import express from "express";
import axios from "axios";
import prisma from "../prisma";
import jwt from "jsonwebtoken";
const authRouter = express.Router();

const config = {
  client_id: process.env.GITHUB_CLIENT_ID,
  client_secret: process.env.GITHUB_CLIENT_SECRET,
};

type GithubTokenResponse = {
  access_token: string;
  scope: string;
  token_type: string;
};

authRouter.get("/login", async (req, res) => {
  // 重定向到认证接口，并配置参数
  let datastr = new Date().valueOf();
  let path = `https://github.com/login/oauth/authorize?client_id=${config.client_id}&state=${datastr}`;
  // 转发到授权服务器
  res.redirect(path);
});

authRouter.get("/oauth/callback", async (req, res) => {
  // 拿到code
  const code = req.query.code;
  const params = {
    client_id: config.client_id,
    client_secret: config.client_secret,
    code: code,
  };
  // 拿着code 请求token
  let result = await axios.post<GithubTokenResponse>(
    "https://github.com/login/oauth/access_token",
    params,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );
  // 获得token
  const access_token = result.data.access_token;
  console.log(access_token);

  const githubres = await axios.get("http://api.github.com/user", {
    headers: {
      Authorization: `token ${access_token}`,
    },
  });

  console.log(githubres.data);
  const { email, name, avatar_url } = githubres.data;

  let user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    user = await prisma.user.create({
      data: { email: email.toLowerCase(), name, password: "empty", avatar_url },
      select: { id: true, name: true, email: true },
    });
  }
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
  res.cookie("token", token, { httpOnly: true });
  res.redirect("/");
});

export default authRouter;
