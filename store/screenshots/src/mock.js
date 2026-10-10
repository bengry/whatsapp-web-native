// Renders the shared mock window parts. All names and messages are invented.

const CHATS = [
  { name: "Weekend trip 🏕️", initials: "WT", color: "#5b8def", preview: "Dana: אני מביאה אוכל לשני הימים", time: "09:41", active: true },
  { name: "Dana Levi", initials: "DL", color: "#e07a5f", preview: "See you at 7!", time: "09:12", unread: 2 },
  { name: "נועם", initials: "נ", color: "#81b29a", preview: "שלחתי לך את הקובץ, תגיד מה דעתך", time: "08:55", unread: 1 },
  { name: "Book club", initials: "BC", color: "#c77dff", preview: "Next pick: Project Hail Mary", time: "Yesterday" },
  { name: "אמא ❤️", initials: "א", color: "#f2a541", preview: "תתקשרו כשאפשר", time: "Yesterday" },
  { name: "Running group", initials: "RG", color: "#3d9970", preview: "Sunday 6:30 at the park", time: "Tuesday" },
  { name: "Yossi Cohen", initials: "YC", color: "#8e9aaf", preview: "Thanks, got it 🙏", time: "Monday" },
];

const TRIP = [
  { from: "Noa", color: "#f28482", text: "מי מביא את האוהל?", time: "09:30", rtl: true },
  { out: true, text: "I've got the tent and the stove 👍", time: "09:31" },
  { from: "Dana", color: "#84a59d", text: "אני מביאה אוכל לשני הימים\nותזכירו לי לקנות קרח בדרך", time: "09:36", rtl: true },
  { from: "Noa", color: "#f28482", text: "Also, parking is ₪20 a day. Bring cash", time: "09:38" },
  { out: true, text: "סגור. יוצאים ב-8 בבוקר?", time: "09:41", rtl: true },
];

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function avatar({ initials, color }) {
  const node = el("div", "avatar", initials);
  node.style.background = color;
  return node;
}

function renderSide(target) {
  target.append(el("h2", "", "Chats"), el("div", "search", "Search or start a new chat"));
  target.append(el("div", "chips", "<span>All</span><span>Unread</span><span>Favorites</span><span>Groups</span>"));
  for (const chat of CHATS) {
    const row = el("div", `row${chat.active ? " active" : ""}`);
    const timeClass = chat.unread ? "time unread" : "time";
    const badge = chat.unread ? `<span class="badge">${chat.unread}</span>` : "";
    row.append(
      avatar(chat),
      el(
        "div",
        "body",
        `<div class="top"><span class="name">${chat.name}</span><span class="${timeClass}">${chat.time}</span></div>` +
          `<div class="bottom"><span class="preview">${chat.preview}</span>${badge}</div>`,
      ),
    );
    target.append(row);
  }
}

// mode: "after" mirrors RTL bubbles like the extension; "before" matches WhatsApp's default:
// an RTL inline span (punctuation correct) inside a left-aligned block.
function bubble(message, mode = "after") {
  const classes = ["msg", message.out ? "out" : "", message.rtl ? (mode === "after" ? "rtl" : "before") : ""];
  const sender = message.from ? `<div style="color:${message.color};font-size:13px;font-weight:600;direction:ltr;text-align:left">${message.from}</div>` : "";
  const text = message.rtl && mode === "before" ? `<span dir="rtl">${message.text}</span>` : message.text;
  return el("div", classes.join(" "), `${sender}${text}<span class="t">${message.time}</span>`);
}

function renderChat(target, { messages = TRIP, mode = "after", title = "Weekend trip 🏕️", subtitle = "Noa, Dana, You" } = {}) {
  const header = el("header");
  header.append(avatar(CHATS[0]), el("div", "", `${title}<small>${subtitle}</small>`));
  const list = el("div", "messages");
  list.append(el("div", "day", "Today"));
  for (const message of messages) list.append(bubble(message, mode));
  target.append(header, list, el("div", "compose", "<div>Type a message</div>"));
}

function renderWindow(target, { title = "WhatsApp Web" } = {}) {
  target.innerHTML = `<div class="titlebar"><i></i><i></i><i></i><span>${title}</span></div>`;
  const app = el("div", "app");
  const rail = el("div", "rail", "<b></b><b></b><b></b><b></b><b></b>");
  const side = el("div", "side");
  const chat = el("div", "chat");
  app.append(rail, side, chat);
  target.append(app);
  renderSide(side);
  return { side, chat };
}
