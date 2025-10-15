const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// بيانات المستخدمين (عادة تحفظ في قاعدة بيانات)
const users = {
  "MOHAMED": {
    username: "MOHAMED",
    name: "Mohamed_Dz",
    avatar: "https://i.pravatar.cc/120?u=MOHAMED",
    points: 9478,
    rank: "SuperAdmin",
    rankIcon: "⭐️✅",
    status: "SAD",
    join: "2025-04-26",
    url: "http://localhost:3000/profile/MOHAMED",
    age: 9,
    country: "الجزائر",
    relation: "أعزب ❤️",
    gender: "ذكر",
    friends: ["Ali", "Sara"],
    premium: "الرتبة الاساسية عضو متألق رتبة 30",
    premiumTime: "16 أيام 9 ساعات 34 دقائق"
  },
  "Ali": {
    username: "Ali",
    name: "Ali",
    avatar: "https://i.pravatar.cc/120?u=ALI",
    points: 5422,
    rank: "عضو",
    rankIcon: "",
    status: "ACTIVE",
    join: "2025-08-10",
    url: "http://localhost:3000/profile/Ali",
    age: 15,
    country: "مصر",
    relation: "أعزب",
    gender: "ذكر",
    friends: ["Mohamed_Dz"],
    premium: "",
    premiumTime: ""
  }
};

// الرسائل
let messages = [];

// جلب كل المستخدمين
app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// جلب ملف مستخدم عبر اسمه
app.get('/api/profile/:username', (req, res) => {
  const user = users[req.params.username];
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({error: "المستخدم غير موجود"});
  }
});

// إرسال رسالة بين المستخدمين
app.post('/api/message', (req, res) => {
  const {from, msg} = req.body;
  messages.push({
    from,
    msg,
    time: new Date().toLocaleTimeString()
  });
  res.json({status: "تم إرسال الرسالة!"});
});

// جلب جميع الرسائل
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.listen(3000, ()=> console.log("Backend running on http://localhost:3000"));