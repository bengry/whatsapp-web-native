// Fail-open status dot in the bottom-left corner, under the sidebar's profile picture.
// Hover it to see which hooks no longer match. It is fixed-positioned on <body>,
// so it keeps working when WhatsApp's own DOM changes.

let brokenChecks = new Set();
let indicator = null;

function createIndicator() {
  const element = document.createElement("div");
  element.id = "wwn-health";
  element.setAttribute("role", "status");
  document.body.append(element);
  return element;
}

function renderIndicator() {
  indicator ??= createIndicator();
  const text = `WhatsApp Web Native: WhatsApp changed its page. Not working: ${[...brokenChecks].sort().join(", ")}. WhatsApp itself still works.`;
  indicator.title = text;
  indicator.setAttribute("aria-label", text);
}

function reportBroken(checks) {
  const next = new Set([...brokenChecks, ...checks]);
  if (next.size === brokenChecks.size) return;
  brokenChecks = next;
  renderIndicator();
}
