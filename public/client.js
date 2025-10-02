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
