// Mark each message with the direction of its last line, so styles/bidi.css can put the
// timestamp on the side where that line ends. CSS alone cannot see this: WhatsApp's dir
// attribute and :dir() follow the first strong character of the whole message.
//
// Fail open: unmarked messages keep WhatsApp's default (timestamp on the right).

const LAST_DIR_ATTRIBUTE = "data-wwn-last-dir";
const RTL_CHAR = /[\u0590-\u08FF\u200F\uFB1D-\uFDFF\uFE70-\uFEFF\u{10800}-\u{10FFF}\u{1E800}-\u{1EFFF}]/u;
// Inside the RTL ranges but not strong: Arabic-Indic digits and combining marks.
const WEAK_CHAR = /[\p{M}\u0660-\u0669\u06F0-\u06F9]/u;
const LTR_CHAR = /[\p{L}\u200E]/u;

function firstStrongDir(text) {
  for (const char of text) {
    if (WEAK_CHAR.test(char)) continue;
    if (RTL_CHAR.test(char)) return "rtl";
    if (LTR_CHAR.test(char)) return "ltr";
  }
  return null;
}

// Links carry their own dir, which makes them isolates that paragraph direction skips.
// The span itself may have no dir, so only count isolates inside it.
function isIsolated(text, span) {
  const isolate = text.parentElement.closest("[dir], bdi");
  return isolate !== span && span.contains(isolate);
}

function inBlock(text, span) {
  for (let element = text.parentElement; element !== span; element = element.parentElement) {
    if (getComputedStyle(element).display !== "inline") return true;
  }
  return false;
}

// What unicode-bidi: plaintext picks for the last paragraph: its first strong character
// outside isolates, else LTR. Walk back from the last text to the paragraph's start,
// which is a line break or a block-level element.
function lastParagraphDir(texts, span) {
  const paragraph = [];
  for (let index = texts.length - 1; index >= 0; index--) {
    const text = texts[index];
    const isLast = index === texts.length - 1;
    if (!isLast && inBlock(text, span)) break;
    const data = isLast ? text.data.trimEnd() : text.data;
    const lineBreak = data.lastIndexOf("\n");
    paragraph.unshift([text, data.slice(lineBreak + 1)]);
    if (lineBreak !== -1) break;
  }
  for (const [text, data] of paragraph) {
    const dir = isIsolated(text, span) ? null : firstStrongDir(data);
    if (dir) return dir;
  }
  return "ltr";
}

// WhatsApp wraps the paragraphs of messages with links or formatting in spans. A block
// span keeps the message span's direction; inline text follows unicode-bidi: plaintext.
function lastLineDir(span) {
  const walker = document.createTreeWalker(span, NodeFilter.SHOW_TEXT);
  const texts = [];
  while (walker.nextNode()) texts.push(walker.currentNode);
  const lastIndex = texts.findLastIndex((text) => text.data.trim());
  if (lastIndex === -1) return null;
  for (let element = texts[lastIndex].parentElement; element !== span; element = element.parentElement) {
    const style = getComputedStyle(element);
    if (style.display !== "inline") return style.direction;
  }
  return lastParagraphDir(texts.slice(0, lastIndex + 1), span);
}

// List items nest their own message-body spans; only the outermost one is the message.
function outermost(span) {
  let outer = span;
  for (let parent = outer.parentElement?.closest(SELECTORS.messageBody); parent; parent = outer.parentElement?.closest(SELECTORS.messageBody)) {
    outer = parent;
  }
  return outer;
}

// Read every direction before writing, so the attribute changes cost one style pass.
// A failure on one message leaves only that message unmarked.
function markMessages(spans) {
  const dirs = [];
  for (const span of new Set([...spans].map(outermost))) {
    if (!span.isConnected) continue;
    try {
      dirs.push([span, lastLineDir(span)]);
    } catch {
      reportBroken(["message direction"]);
    }
  }
  for (const [span, dir] of dirs) {
    if (dir) span.setAttribute(LAST_DIR_ATTRIBUTE, dir);
    else span.removeAttribute(LAST_DIR_ATTRIBUTE);
  }
}

function changedMessages(records) {
  const spans = new Set();
  for (const record of records) {
    const nodes = record.type === "characterData" ? [record.target] : [record.target, ...record.addedNodes];
    for (const node of nodes) {
      const element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      // Typing in the compose box must not cost a style pass per keystroke.
      if (!element || element.closest("footer, [contenteditable]")) continue;
      const enclosing = element.closest(SELECTORS.messageBody);
      if (enclosing) spans.add(enclosing);
      if (node.nodeType === Node.ELEMENT_NODE && record.target !== node) {
        node.querySelectorAll(SELECTORS.messageBody).forEach((span) => spans.add(span));
      }
    }
  }
  return spans;
}

// WhatsApp replaces #main on every chat switch, and closing a chat or changing the layout
// can replace its ancestors too. Watch the whole app for #main leaving the page.
function watchChat(main) {
  return new Promise((resolve) => {
    markMessages(main.querySelectorAll(SELECTORS.messageBody));
    const messages = new MutationObserver((records) => markMessages(changedMessages(records)));
    messages.observe(main, { childList: true, subtree: true, characterData: true });
    const swap = new MutationObserver(() => {
      if (main.isConnected) return;
      messages.disconnect();
      swap.disconnect();
      resolve();
    });
    swap.observe(document.getElementById("app") ?? document.body, { childList: true, subtree: true });
  });
}

async function watchChats() {
  for (;;) {
    const main = await waitFor(SELECTORS.openChat, Infinity);
    await watchChat(main);
  }
}

watchChats();
