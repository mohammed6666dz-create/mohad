const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // يسمح لأي رابط يتصل بالسيرفر
    methods: ["GET", "POST"]
  }
});

app.use(cors());

// كل الملفات الأمامية في public/
app.use(express.static(path.join(__dirname, "public")));

// إرسال index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// غرف ورسائل
let rooms = {}; // لتخزين الرسائل مؤقتاً لكل غرفة

// ✅ قوائم جديدة للرتب والحضر والكتم والطرد
let users = {}; // socket.id => { username, role, room }
let bans = {};  // room => [usernames]
let mutes = {}; // room => [usernames]
let kicks = {}; // room => [usernames]

// ✅ ترتيب الصلاحيات
const hierarchy = ["Member", "Admin", "SuperAdmin", "Owner", "SiteManager"];

function canAct(actorRole, targetRole) {
  return hierarchy.indexOf(actorRole) > hierarchy.indexOf(targetRole);
}

io.on("connection", (socket) => {
  console.log("✅ مستخدم دخل");

  // دخول غرفة
  socket.on("joinRoom", ({ room, username, avatar, role }) => {
    socket.join(room);
    if (!rooms[room]) rooms[room] = [];
    if (!bans[room]) bans[room] = [];
    if (!mutes[room]) mutes[room] = [];
    if (!kicks[room]) kicks[room] = [];

    // نخزن بيانات المستخدم
    users[socket.id] = { username, role: role || "Member", room };

    // إذا محظور ما يخشاش
    if (bans[room].includes(username)) {
      socket.emit("systemMessage", "❌ انت محظور من هذه الغرفة");
      socket.leave(room);
      return;
    }

    // إرسال الرسائل القديمة للمستخدم الجديد
    socket.emit("messageHistory", rooms[room]);

    // إعلام الجميع بالانضمام
    const joinMsg = {
      user: "النظام",
      text: `${username} انضم إلى الغرفة`,
      time: new Date().toLocaleTimeString()
    };
    io.to(room).emit("message", joinMsg);
  });

  // استقبال رسالة
  socket.on("chatMessage", ({ room, user, avatar, msg, time }) => {
    // تحقق من الكتم
    if (mutes[room] && mutes[room].includes(user)) {
      socket.emit("systemMessage", "❌ انت مكتوم");
      return;
    }

    const message = { 
      user, 
      role: users[socket.id]?.role || "Member", // ✅ نرسل مع الرسالة الرتبة
      avatar, 
      text: msg, 
      time 
    };

    if (!rooms[room]) rooms[room] = [];
    rooms[room].push(message);

    io.to(room).emit("message", message); // إرسال لكل المستخدمين في الغرفة
  });

  // ✅ أوامر الأدمنية
  socket.on("banUser", ({ target }) => {
    const actor = users[socket.id];
    const targetSocket = Object.values(io.sockets.sockets).find(
      s => users[s.id]?.username === target
    );

    if (!actor || !targetSocket) return;
    const targetUser = users[targetSocket.id];

    if (canAct(actor.role, targetUser.role)) {
      bans[actor.room].push(targetUser.username);
      targetSocket.leave(actor.room);
      targetSocket.emit("banned", actor.room);
      io.to(actor.room).emit("systemMessage", `${targetUser.username} تم حظره`);
    }
  });

  socket.on("muteUser", ({ target }) => {
    const actor = users[socket.id];
    const targetSocket = Object.values(io.sockets.sockets).find(
      s => users[s.id]?.username === target
    );
    if (!actor || !targetSocket) return;
    const targetUser = users[targetSocket.id];

    if (canAct(actor.role, targetUser.role)) {
      mutes[actor.room].push(targetUser.username);
      targetSocket.emit("muted", actor.room);
      io.to(actor.room).emit("systemMessage", `${targetUser.username} تم كتمه`);
    }
  });

  socket.on("kickUser", ({ target }) => {
    const actor = users[socket.id];
    const targetSocket = Object.values(io.sockets.sockets).find(
      s => users[s.id]?.username === target
    );
    if (!actor || !targetSocket) return;
    const targetUser = users[targetSocket.id];

    if (canAct(actor.role, targetUser.role)) {
      targetSocket.leave(actor.room);
      targetSocket.emit("kicked", actor.room);
      io.to(actor.room).emit("systemMessage", `${targetUser.username} تم طرده`);
    }
  });

  // ✅ فك الحظر/الكتم
  socket.on("unBanUser", ({ target }) => {
    const actor = users[socket.id];
    if (!actor) return;
    bans[actor.room] = bans[actor.room].filter(u => u !== target);
    io.to(actor.room).emit("systemMessage", `${target} تم فك الحظر عنه`);
  });

  socket.on("unMuteUser", ({ target }) => {
    const actor = users[socket.id];
    if (!actor) return;
    mutes[actor.room] = mutes[actor.room].filter(u => u !== target);
    io.to(actor.room).emit("systemMessage", `${target} تم فك الكتم عنه`);
  });

  socket.on("disconnect", () => {
    console.log("❌ مستخدم خرج");
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`));
// ✨ دالة تعرض إشعار عصري في الشات
function addSystemMsg(text){
  const div = document.createElement("div");
  div.className = "system-msg";
  div.innerHTML = `✨ ${text} ✨`;
  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}
function setRank(rank){
  if(selectedUser){
    userRanks[selectedUser] = rank;
    addSystemMsg(`مبروك! ${selectedUser} أخذ رتبة ${rank}`);
  }
  document.getElementById("userMenu").style.display = "none";
}
// كي يدخل واحد للغرفة
socket.on("joinRoom", ({ room, username, avatar }) => {
  socket.join(room);

  // بعث رسالة سيستم للجميع
  io.to(room).emit("systemMessage", `${username} دخل إلى الغرفة`);

  // تخزين الاسم مع السوكات
  socket.username = username;
  socket.room = room;
});

// كي يخرج (disconnect)
socket.on("disconnect", () => {
  if (socket.room && socket.username) {
    io.to(socket.room).emit("systemMessage", `${socket.username} خرج من الغرفة`);
  }
});
// الاتصال بالسيرفر
const socket = io("https://friendly-umbrella-urtz.onrender.com/");

// الانضمام للغرفة
const room = "عام"; // ممكن تغيّر حسب الغرفة
socket.emit("joinRoom", { room, username, avatar });

// استقبال الرسائل القديمة
socket.on("messageHistory", (messages) => {
  messages.forEach(msg => {
    addMessageToDOM(msg.user, msg.avatar || "https://i.pravatar.cc/60", msg.msg || msg.text, msg.user === username, msg.time);
  });
});

// استقبال الرسائل الجديدة
socket.on("message", (msg) => {
  addMessageToDOM(msg.user, msg.avatar || "https://i.pravatar.cc/60", msg.msg || msg.text, msg.user === username, msg.time);
});

// systemMessage
socket.on("systemMessage", (txt) => {
  addMessageToDOM("النظام", "https://i.pravatar.cc/60", txt, false);
});

// تعديل sendMessage لإرسال الرسائل للسيرفر
function sendMessage(){
  const txt = input.value.trim();
  if(!txt) return;

  // إرسال للباك إند
  socket.emit("chatMessage", { room, user: username, avatar, msg: txt, time: new Date().toLocaleTimeString() });

  // عرضها محلياً
  addMessageToDOM(username, avatar, txt, true, new Date().toLocaleTimeString());
  input.value = "";
}
