export function sanitizeHTML(dirty) {
  const div = document.createElement("div");
  div.textContent = dirty;
  return div.innerHTML;
}
