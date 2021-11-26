import express from "express";
import prisma from "../prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const authRouter = express.Router();

async function sendEmail(to, code) {
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secureConnection: true,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // generated ethereal user
      pass: process.env.EMAIL_PASS, // generated ethereal password
    },
  });

  try {
  } catch (error) {}

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"${process.env.EMAIL_USER_NAME}" <${process.env.EMAIL_USER}>`, // sender address
    to, // list of receivers
    subject: "注册验证", // Subject line
    //text: "Hello world?", // plain text body
    html: `欢迎你注册，点击<b><a href="${process.env.DOMAIN}/api/auth/email_check?code=${code}&email=${to}">验证</a></b>确认验证通过！`, // html body
  });

  return info;
}

authRouter.get("/email_check", async (req, res) => {
  const code = req.query.code as string;
  const email = req.query.email as string;
  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });
  if (user && user.emailCheckCode === code && user.checked == false) {
    await prisma.user.update({
      where: {
        email: email.toLowerCase(),
      },
      data: {
        checked: true,
      },
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/");
  } else {
    res.send("您的邮箱已验证通过");
  }
});
authRouter.post("/register", async (req, res) => {
  const { email, name, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });
  if (user) {
    res.json({
      message: "该邮箱已经注册！",
      success: false,
    });
    return;
  }

  //生成salt的迭代次数
  const saltRounds = 10;
  //随机生成salt
  const salt = bcrypt.genSaltSync(saltRounds);
  //获取hash值
  const hash = bcrypt.hashSync(password, salt);

  const emailCheckCode = bcrypt.hashSync(email, salt);

  try {
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hash,
        emailCheckCode,
        checked: false,
      },
      select: { id: true, name: true, email: true },
    });

    res.json({
      message: "验证邮件已发送，请前往邮箱确认",
      success: true,
    });

    const info = await sendEmail(email, emailCheckCode);

    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
});

authRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
    },
  });
  if (!user) {
    res.json({
      success: false,
      message: "邮箱未注册！",
    });
    return;
  }
  if (!user.checked) {
    res.json({
      success: false,
      message: "邮箱未验证！",
    });
  }

  //检查密码是否匹配
  const pwdMatchFlag = bcrypt.compareSync(password, user.password);
  if (pwdMatchFlag) {
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.cookie("token", token, { httpOnly: true });
    res.json({
      token: token,
      success: true,
    });
  } else {
    res.json({
      success: false,
      message: "邮箱或者密码错误！",
    });
  }
});

authRouter.post("/signout", async (req, res) => {
  res.clearCookie("token");
  res.sendStatus(204);
});

export default authRouter;
