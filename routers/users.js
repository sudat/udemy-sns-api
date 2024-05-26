const router = require("express").Router();
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const isAuthenticated = require("../middlewares/isAuthenticated");

const prisma = new PrismaClient();

router.get("/find", isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });
    if (!user) {
      res.status(404).json({ message: "Userが見つかりませんでした。" });
    }
    res
      .status(200)
      .json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/profile/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!profile) {
      return res
        .status(404)
        .json({ message: "プロフィールが見つかりませんでした。" });
    }
    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
