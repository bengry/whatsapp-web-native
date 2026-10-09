// Shortcuts that WhatsApp Web has no built-in key for.
// Karabiner turns the native keys (Cmd+1…9, Cmd+Shift+[ / ]) into Ctrl+Option+<key>,
// so Chrome never claims them. See karabiner/whatsapp-web-native.json.

const ROW_SELECTOR = '#pane-side [role="row"], #pane-side [role="listitem"]';

// Rows are virtualized and positioned with transforms, so DOM order is not screen order.
function chatRows() {
  return [...document.querySelectorAll(ROW_SELECTOR)]
    .filter((row) => !row.parentElement.closest(ROW_SELECTOR))
    .filter((row) => row.offsetParent !== null)
    .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
}

function isSelected(row) {
  return row.matches('[aria-selected="true"]') || row.querySelector('[aria-selected="true"]') !== null;
}

// WhatsApp's handler sits below the gridcell, so dispatch from the innermost text
// and let the events bubble up. It needs the pointer events, not only mouse/click.
function openRow(row) {
  if (!row) return;
  const target = row.querySelector("span[title]") ?? row;
  const init = { bubbles: true, cancelable: true, composed: true, view: window, button: 0 };
  target.dispatchEvent(new PointerEvent("pointerdown", init));
  target.dispatchEvent(new MouseEvent("mousedown", init));
  target.dispatchEvent(new PointerEvent("pointerup", init));
  target.dispatchEvent(new MouseEvent("mouseup", init));
  target.dispatchEvent(new MouseEvent("click", init));
}

function jumpTo(index) {
  openRow(chatRows()[index]);
}

function step(offset) {
  const rows = chatRows();
  const current = rows.findIndex(isSelected);
  const next = current === -1 ? 0 : current + offset;
  openRow(rows[Math.max(0, Math.min(rows.length - 1, next))]);
}

function actionFor(event) {
  const digit = /^Digit([1-9])$/.exec(event.code);
  if (digit) return () => jumpTo(Number(digit[1]) - 1);
  if (event.code === "ArrowDown") return () => step(1);
  if (event.code === "ArrowUp") return () => step(-1);
  return null;
}

window.addEventListener(
  "keydown",
  (event) => {
    if (!event.ctrlKey || !event.altKey || event.metaKey || event.shiftKey) return;
    const action = actionFor(event);
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    action();
  },
  true,
);
