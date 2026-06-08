import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { isQuestionNode } from '@lrama1/dynamic-questionnaire-renderer';
import styles from './EdgeConditionPanel.module.css';
const OPERATORS = [
    { value: 'equals', label: 'equals' },
    { value: 'notEquals', label: 'not equals' },
    { value: 'contains', label: 'contains' },
    { value: 'notContains', label: 'does not contain' },
    { value: 'greaterThan', label: 'greater than' },
    { value: 'lessThan', label: 'less than' },
    { value: 'greaterThanOrEqual', label: 'greater or equal' },
    { value: 'lessThanOrEqual', label: 'less or equal' },
    { value: 'isEmpty', label: 'is empty' },
    { value: 'notEmpty', label: 'is not empty' },
    { value: 'in', label: 'in list' },
    { value: 'notIn', label: 'not in list' },
];
function isSimple(c) {
    return 'field' in c && 'operator' in c;
}
function isCompound(c) {
    return 'logic' in c && 'conditions' in c;
}
const EMPTY_SIMPLE = {
    field: '',
    operator: 'equals',
    value: '',
};
export const EdgeConditionPanel = ({ edge, nodes, onChange, onDelete, onClose, }) => {
    const condition = edge.data?.condition;
    // ── Simple condition editor ───────────────────────────────
    const handleSimpleChange = (partial) => {
        if (condition && isSimple(condition)) {
            onChange({ ...condition, ...partial });
        }
        else {
            onChange({ ...EMPTY_SIMPLE, ...partial });
        }
    };
    // ── Toggle simple / compound ─────────────────────────────
    const handleToggleMode = () => {
        if (!condition || isSimple(condition)) {
            // Switch to compound
            onChange({
                logic: 'AND',
                conditions: condition ? [condition] : [],
            });
        }
        else {
            // Switch to simple (take first sub-condition or empty)
            const first = condition.conditions[0];
            onChange(first ?? undefined);
        }
    };
    // ── Compound condition helpers ────────────────────────────
    const handleAddSubCondition = () => {
        const compound = condition ?? {
            logic: 'AND',
            conditions: [],
        };
        onChange({
            ...compound,
            conditions: [...compound.conditions, { ...EMPTY_SIMPLE }],
        });
    };
    const handleSubConditionChange = (index, sub) => {
        if (condition && isCompound(condition)) {
            const updated = [...condition.conditions];
            updated[index] = sub;
            onChange({ ...condition, conditions: updated });
        }
    };
    const handleRemoveSubCondition = (index) => {
        if (condition && isCompound(condition)) {
            const updated = condition.conditions.filter((_, i) => i !== index);
            if (updated.length === 0) {
                onChange(undefined); // no condition
            }
            else {
                onChange({ ...condition, conditions: updated });
            }
        }
    };
    const handleLogicToggle = () => {
        if (condition && isCompound(condition)) {
            onChange({
                ...condition,
                logic: condition.logic === 'AND' ? 'OR' : 'AND',
            });
        }
    };
    // ── Remove condition entirely ─────────────────────────────
    const handleRemoveCondition = () => {
        onChange(undefined);
    };
    // ── Render simple condition ───────────────────────────────
    const renderSimpleCondition = (sc, onChangeSc, showRemove) => {
        // Look up the source node to see if it has predefined options (question nodes only)
        const sourceNode = nodes.find((n) => n.id === sc.field);
        const questionSource = sourceNode && isQuestionNode(sourceNode) ? sourceNode : null;
        const sourceOptions = questionSource?.data.options ?? [];
        const hasPredefinedOptions = questionSource != null &&
            (questionSource.data.answerType === 'dropdown' ||
                questionSource.data.answerType === 'radio' ||
                questionSource.data.answerType === 'checkbox') &&
            sourceOptions.filter((o) => o.label.trim() !== '').length > 0;
        return (_jsxs("div", { className: styles.conditionRow, children: [_jsxs("select", { value: sc.field, onChange: (e) => onChangeSc({ ...sc, field: e.target.value, value: '' }), className: styles.select, children: [_jsx("option", { value: "", children: "-- select source --" }), nodes
                            .filter((n) => n.id !== edge.target)
                            .map((n) => (_jsx("option", { value: n.id, children: isQuestionNode(n) ? (n.data.question || n.id) : (n.type === 'start' ? '▶ Start' : '⏹ End') }, n.id)))] }), _jsx("select", { value: sc.operator, onChange: (e) => onChangeSc({
                        ...sc,
                        operator: e.target.value,
                    }), className: styles.select, children: OPERATORS.map((op) => (_jsx("option", { value: op.value, children: op.label }, op.value))) }), sc.operator !== 'isEmpty' && sc.operator !== 'notEmpty' && (hasPredefinedOptions ? (_jsxs("select", { value: sc.value != null ? String(sc.value) : '', onChange: (e) => onChangeSc({ ...sc, value: e.target.value }), className: styles.select, children: [_jsx("option", { value: "", children: "-- select value --" }), sourceOptions
                            .filter((o) => o.label.trim() !== '')
                            .map((o) => (_jsx("option", { value: o.value, children: o.label }, o.value)))] })) : (_jsx("input", { type: "text", value: sc.value != null ? String(sc.value) : '', onChange: (e) => onChangeSc({ ...sc, value: e.target.value }), placeholder: "value", className: styles.input }))), showRemove && (_jsx("button", { className: styles.removeSubBtn, onClick: () => onChangeSc(EMPTY_SIMPLE), title: "Remove sub-condition", children: "\u2715" }))] }));
    };
    // ── Render compound condition ─────────────────────────────
    const renderCompoundCondition = (cc) => (_jsxs("div", { children: [_jsxs("div", { className: styles.logicRow, children: [_jsx("span", { className: styles.logicLabel, children: "Combine with:" }), _jsx("button", { className: `${styles.logicBtn} ${cc.logic === 'AND' ? styles.logicActive : ''}`, onClick: handleLogicToggle, children: "AND" }), _jsx("button", { className: `${styles.logicBtn} ${cc.logic === 'OR' ? styles.logicActive : ''}`, onClick: handleLogicToggle, children: "OR" })] }), cc.conditions.map((sub, idx) => (_jsxs("div", { className: styles.subCondition, children: [_jsxs("span", { className: styles.subIndex, children: ["#", idx + 1] }), isSimple(sub) ? (renderSimpleCondition(sub, (updated) => handleSubConditionChange(idx, updated), false)) : (_jsx("div", { className: styles.nestedNote, children: "Nested compound not supported" })), _jsx("button", { className: styles.removeSubBtn, onClick: () => handleRemoveSubCondition(idx), children: "\u2715" })] }, idx))), _jsx("button", { className: styles.addSubBtn, onClick: handleAddSubCondition, children: "+ Add Condition" })] }));
    // ── Main render ───────────────────────────────────────────
    return (_jsxs("div", { className: styles.panel, children: [_jsxs("div", { className: styles.header, children: [_jsx("h3", { children: "Edge Condition" }), _jsx("button", { className: styles.closeBtn, onClick: onClose, "aria-label": "Close", children: "\u2715" })] }), _jsx("div", { className: styles.info, children: _jsxs("span", { className: styles.edgeLabel, children: [edge.source, " \u2192 ", edge.target] }) }), condition ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: styles.modeRow, children: [_jsx("span", { children: "Mode:" }), _jsx("button", { className: styles.modeBtn, onClick: handleToggleMode, children: isSimple(condition) ? 'Simple (click for AND/OR)' : 'Compound (click for simple)' }), _jsx("button", { className: styles.removeConditionBtn, onClick: handleRemoveCondition, children: "Remove" })] }), isSimple(condition)
                        ? renderSimpleCondition(condition, (c) => onChange(c))
                        : renderCompoundCondition(condition)] })) : (_jsxs("div", { className: styles.noCondition, children: [_jsx("p", { children: "No condition \u2013 this edge is always followed." }), _jsx("button", { className: styles.addConditionBtn, onClick: () => onChange({ ...EMPTY_SIMPLE }), children: "+ Add Condition" })] })), _jsx("div", { className: styles.actions, children: _jsx("button", { className: styles.deleteBtn, onClick: onDelete, children: "\uD83D\uDDD1 Delete Edge" }) })] }));
};
