// الاتصال بالسيرفر
const socket = io("https://friendly-umbrella-urtz.onrender.com/");

// بيانات المستخدم من URL
const params = new URLSearchParams(window.location.search);
const username = params.get("user") || "مجهول";
const room = params.get("room") || "عام";

// الانضمام للغرفة
socket.emit("joinRoom", { room, username, avatar: "" });

// استقبال الرسائل القديمة
socket.on("messageHistory", (messages) => {
  const box = document.getElementById("chat-box");
  messages.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.user === username ? "message me" : "message other";
    div.innerText = msg.user + ": " + msg.msg;
    box.appendChild(div);
  });
  box.scrollTop = box.scrollHeight;
});

// استقبال الرسائل الجديدة
socket.on("message", (msg) => {
  if(!msg || !msg.user) return; // يمنع الخطأ
  const box = document.getElementById("chat-box");
  const div = document.createElement("div");
  div.className = msg.user === username ? "message me" : "message other";
  div.innerText = msg.user + ": " + (msg.msg || msg.text || "");
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
});
