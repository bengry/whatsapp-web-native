// Self-check: after WhatsApp loads, and again on the first opened chat, test every
// hook in SELECTORS. A WhatsApp update then shows up as the status dot (indicator.js)
// instead of features that silently stop working.

const READY_TIMEOUT_MS = 60_000;
const ROWS_TIMEOUT_MS = 10_000;
const CHAT_RENDER_MS = 2_000;

const STARTUP_CHECKS = [
  { name: "chat rows", test: () => document.querySelector(SELECTORS.chatRow) !== null },
  {
    name: "chat row click target",
    test: () => document.querySelector(SELECTORS.chatRow).querySelector(SELECTORS.rowClickTarget) !== null,
  },
  {
    name: "chat row selection marker",
    test: () => document.querySelector(SELECTORS.chatRow).querySelector(SELECTORS.rowSelectable) !== null,
  },
  {
    // With no chat open, the download card we hide must exist.
    name: "download card",
    test: () => document.querySelector(SELECTORS.openChat) !== null || document.querySelector(SELECTORS.nagCard) !== null,
  },
  {
    name: "styles injected",
    test: () => getComputedStyle(document.querySelector(SELECTORS.chatRow)).fontFamily.includes("apple-system"),
  },
];

const CHAT_CHECKS = [
  { name: "compose box", test: () => document.querySelector(SELECTORS.composeBox) !== null },
  { name: "message text", test: () => document.querySelector(SELECTORS.messageText) !== null },
];

function waitFor(selector, timeoutMs) {
  return new Promise((resolve) => {
    const found = document.querySelector(selector);
    if (found) return resolve(found);
    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (!element) return;
      observer.disconnect();
      resolve(element);
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
    if (Number.isFinite(timeoutMs)) {
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeoutMs);
    }
  });
}

function failedChecks(checks) {
  return checks.filter(({ test }) => {
    try {
      return !test();
    } catch {
      return true;
    }
  }).map(({ name }) => name);
}

async function runHealthChecks() {
  const chatList = await waitFor(SELECTORS.chatList, READY_TIMEOUT_MS);
  if (!chatList) {
    // Logged out (QR screen) is not a breakage.
    if (!document.querySelector(SELECTORS.loginScreen)) reportBroken(["chat list"]);
    return;
  }
  await waitFor(SELECTORS.chatRow, ROWS_TIMEOUT_MS);
  // The right-hand pane (intro card, or an open chat) renders after the chat list.
  await waitFor(`${SELECTORS.openChat}, ${SELECTORS.nagCard}`, ROWS_TIMEOUT_MS);
  reportBroken(failedChecks(STARTUP_CHECKS));

  await waitFor(SELECTORS.openChat, Infinity);
  await new Promise((resolve) => setTimeout(resolve, CHAT_RENDER_MS));
  reportBroken(failedChecks(CHAT_CHECKS));
}

runHealthChecks();
