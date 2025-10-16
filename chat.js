const express = require("express");
const router = express.Router();

// قاعدة بيانات مؤقتة في الذاكرة
const messages = [];

// إرسال رسالة جديدة
router.post("/send", (req, res) => {
  const { user, text } = req.body;
  if (!user || !text) {
    return res.status(400).json({ error: "البيانات ناقصة" });
  }
  const msg = { user, text, time: new Date() };
  messages.push(msg);
  res.json({ success: true, message: msg });
});

// جلب كل الرسائل
router.get("/all", (req, res) => {
  res.json(messages);
});

module.exports = router;
