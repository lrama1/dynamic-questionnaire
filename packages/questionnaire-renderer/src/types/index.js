// ── Answer Types ──────────────────────────────────────────────
// ── Type guards ────────────────────────────────────────────────
export function isQuestionNode(node) {
    return node.type === 'question';
}
export function isStartNode(node) {
    return node.type === 'start';
}
export function isEndNode(node) {
    return node.type === 'end';
}
