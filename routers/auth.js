const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateIdenticon = require("../util/generateIdenticon");
require("dotenv").config();

const prisma = new PrismaClient();

// 新規ユーザ登録API
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const defaultIconImage = generateIdenticon(email);
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      profile: {
        create: { bio: "はじめまして", profileImageUrl: defaultIconImage },
      },
    },
    include: { profile: true },
  });

  return res.json({ user });
});

//ユーザーログインAPI
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    return res.status(401).json({ error: "そのユーザは存在しません。" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "そのパスワードは間違っています。" });
  }

  const token = jwt.sign({ id: user.id }, process.env.SERCRET_KEY, {
    expiresIn: "1d",
  });
  return res.json({ token });
});

module.exports = router;
