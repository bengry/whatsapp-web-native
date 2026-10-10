// Shortcuts that WhatsApp Web has no built-in key for.
// Karabiner turns the native keys (Cmd+1…9, Cmd+Shift+[ / ]) into Ctrl+Option+<key>,
// so Chrome never claims them. See karabiner/mac-mode-for-whatsapp-web.json.
//
// Fail open: a key is consumed only when its action ran. If WhatsApp's page changes
// and no chat rows match, the key passes through untouched and the breakage is reported.

const OPEN_CHECK_MS = 1_000;

// Rows are virtualized and positioned with transforms, so DOM order is not screen order.
function chatRows() {
  return [...document.querySelectorAll(SELECTORS.chatRow)]
    .filter((row) => row.offsetParent !== null)
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
}

function isSelected(row) {
  return row.querySelector(SELECTORS.rowSelected) !== null;
}

// A re-render can replace the row node, so only judge rows still on the page.
function checkOpened(row) {
  setTimeout(() => {
    if (row.isConnected && !isSelected(row)) reportBroken(["open chat from shortcut"]);
  }, OPEN_CHECK_MS);
}

// WhatsApp's handler sits below the gridcell, so dispatch from the innermost text
// and let the events bubble up. It needs the pointer events, not only mouse/click.
function openRow(row) {
  const target = row?.querySelector(SELECTORS.rowClickTarget);
  if (!target) return false;
  const init = { bubbles: true, cancelable: true, composed: true, view: window, button: 0 };
  target.dispatchEvent(new PointerEvent("pointerdown", init));
  target.dispatchEvent(new MouseEvent("mousedown", init));
  target.dispatchEvent(new PointerEvent("pointerup", init));
  target.dispatchEvent(new MouseEvent("mouseup", init));
  target.dispatchEvent(new MouseEvent("click", init));
  checkOpened(row);
  return true;
}

function jumpTo(index) {
  return openRow(chatRows()[index]);
}

function step(offset) {
  const rows = chatRows();
  if (rows.length === 0) return false;
  const current = rows.findIndex(isSelected);
  const next = current === -1 ? 0 : current + offset;
  return openRow(rows[Math.max(0, Math.min(rows.length - 1, next))]);
}

function actionFor(event) {
  const digit = /^Digit([1-9])$/.exec(event.code);
  if (digit) return () => jumpTo(Number(digit[1]) - 1);
  if (event.code === "ArrowDown") return () => step(1);
  if (event.code === "ArrowUp") return () => step(-1);
  return null;
}

function runAction(action) {
  try {
    return action();
  } catch {
    reportBroken(["shortcut error"]);
    return false;
  }
}

window.addEventListener(
  "keydown",
  (event) => {
    if (!event.ctrlKey || !event.altKey || event.metaKey || event.shiftKey) return;
    const action = actionFor(event);
    if (!action || !runAction(action)) return;
    event.preventDefault();
    event.stopPropagation();
  },
  true,
);
