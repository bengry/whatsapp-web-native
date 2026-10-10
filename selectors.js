// Every WhatsApp DOM hook the scripts use. When WhatsApp changes its page, fix it here
// (CSS hooks live in styles/*.css).
const SELECTORS = Object.freeze({
  chatList: "#pane-side",
  chatRow: '#pane-side [role="row"]',
  rowClickTarget: "span[title]",
  rowSelectable: "[aria-selected]",
  rowSelected: '[aria-selected="true"]',
  openChat: "#main",
  composeBox: '#main footer [contenteditable="true"]',
  messageText: "#main .copyable-text",
  messageBody: 'span[data-testid="selectable-text"]',
  nagCard: '[data-testid="intro_panel_v2_title_card"]',
  loginScreen: "[data-ref], canvas[aria-label]",
});
