// ── Operator evaluation ────────────────────────────────────────
function evaluateOperator(fieldValue, operator, compareValue) {
    switch (operator) {
        case 'equals':
            return fieldValue === compareValue;
        case 'notEquals':
            return fieldValue !== compareValue;
        case 'contains':
            return String(fieldValue ?? '').includes(String(compareValue ?? ''));
        case 'notContains':
            return !String(fieldValue ?? '').includes(String(compareValue ?? ''));
        case 'greaterThan':
            return Number(fieldValue) > Number(compareValue);
        case 'lessThan':
            return Number(fieldValue) < Number(compareValue);
        case 'greaterThanOrEqual':
            return Number(fieldValue) >= Number(compareValue);
        case 'lessThanOrEqual':
            return Number(fieldValue) <= Number(compareValue);
        case 'isEmpty':
            return fieldValue === null || fieldValue === undefined || fieldValue === '';
        case 'notEmpty':
            return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
        case 'in': {
            const list = Array.isArray(compareValue) ? compareValue : [compareValue];
            return list.includes(fieldValue);
        }
        case 'notIn': {
            const list = Array.isArray(compareValue) ? compareValue : [compareValue];
            return !list.includes(fieldValue);
        }
        default:
            return true;
    }
}
// ── Condition evaluation ───────────────────────────────────────
function isSimpleCondition(c) {
    return 'field' in c && 'operator' in c;
}
function isCompoundCondition(c) {
    return 'logic' in c && 'conditions' in c;
}
/**
 * Evaluate whether an edge's condition is satisfied given current answers.
 * Returns true if the edge has no condition (unconditional transition).
 */
export function evaluateCondition(condition, answers) {
    // No condition → always allowed
    if (!condition)
        return true;
    if (isSimpleCondition(condition)) {
        const fieldValue = answers[condition.field];
        return evaluateOperator(fieldValue, condition.operator, condition.value);
    }
    if (isCompoundCondition(condition)) {
        const results = condition.conditions.map((c) => evaluateCondition(c, answers));
        return condition.logic === 'AND'
            ? results.every(Boolean)
            : results.some(Boolean);
    }
    return true;
}
/**
 * Given a node id and current answers, find the next node(s) that should be
 * visited.  Returns the first matching edge target, or undefined if no
 * outgoing edge is satisfied (meaning the questionnaire ends).
 */
export function getNextNodeId(currentNodeId, edges, answers) {
    const outgoing = edges.filter((e) => e.source === currentNodeId);
    for (const edge of outgoing) {
        if (evaluateCondition(edge.data?.condition, answers)) {
            return edge.target;
        }
    }
    return undefined; // end of flow
}
