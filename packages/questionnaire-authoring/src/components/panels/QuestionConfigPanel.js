import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import styles from './QuestionConfigPanel.module.css';
// ── Option parsing helpers ───────────────────────────────────
/**
 * Convert an array of OptionItem back to the textarea format.
 * `Label | value` if they differ, otherwise just `Label`.
 */
function optionsToText(opts) {
    return opts
        .map((o) => (o.label !== o.value ? `${o.label} | ${o.value}` : o.label))
        .join('\n');
}
/**
 * Parse textarea lines into OptionItem[].
 * Lines with `|` are split into label/value; otherwise label = value.
 * Empty lines are kept as-is so the textarea doesn't eat the line
 * the user just created — consumers should filter by non-empty label.
 */
function textToOptions(text) {
    return text
        .split('\n')
        .map((line) => line.trim())
        .map((line) => {
        if (line === '') {
            return { label: '', value: '' };
        }
        const pipeIdx = line.indexOf('|');
        if (pipeIdx === -1) {
            return { label: line, value: line };
        }
        const label = line.slice(0, pipeIdx).trim();
        const value = line.slice(pipeIdx + 1).trim();
        return {
            label: label || value || line,
            value: value || label || line,
        };
    });
}
const ANSWER_TYPES = [
    { value: 'free-text', label: 'Free Text' },
    { value: 'dropdown', label: 'Dropdown' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'numeric-stepper', label: 'Numeric Stepper' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'date', label: 'Date Picker' },
    { value: 'boolean', label: 'Yes / No' },
];
export const QuestionConfigPanel = ({ node, onChange, onDelete, onClose, }) => {
    const { data } = node;
    // ── Local state for the options textarea ──────────────────
    // We keep the raw text in local state so the user can type
    // freely (including | and newlines) without the controlled
    // roundtrip fighting them.  Parsing → OptionItem[] happens on blur.
    const [optionsText, setOptionsText] = useState(() => optionsToText(data.options ?? []));
    // Reset local text when switching to a different node
    useEffect(() => {
        setOptionsText(optionsToText(data.options ?? []));
    }, [node.id]); // eslint-disable-line react-hooks/exhaustive-deps
    return (_jsxs("div", { className: styles.panel, children: [_jsxs("div", { className: styles.header, children: [_jsx("h3", { children: "Question Settings" }), _jsx("button", { className: styles.closeBtn, onClick: onClose, "aria-label": "Close", children: "\u2715" })] }), _jsxs("label", { className: styles.field, children: [_jsx("span", { children: "Question Text" }), _jsx("input", { type: "text", value: data.question, onChange: (e) => onChange({ question: e.target.value }), placeholder: "Enter your question\u2026" })] }), _jsxs("label", { className: styles.field, children: [_jsx("span", { children: "Description (optional)" }), _jsx("textarea", { value: data.description ?? '', onChange: (e) => onChange({ description: e.target.value || undefined }), placeholder: "Additional context\u2026", rows: 2 })] }), _jsxs("label", { className: styles.field, children: [_jsx("span", { children: "Answer Type" }), _jsx("select", { value: data.answerType, onChange: (e) => onChange({ answerType: e.target.value }), children: ANSWER_TYPES.map((at) => (_jsx("option", { value: at.value, children: at.label }, at.value))) })] }), _jsxs("label", { className: styles.checkField, children: [_jsx("input", { type: "checkbox", checked: data.required ?? false, onChange: (e) => onChange({ required: e.target.checked }) }), _jsx("span", { children: "Required" })] }), (data.answerType === 'dropdown' ||
                data.answerType === 'radio' ||
                data.answerType === 'checkbox') && (_jsxs("div", { className: styles.field, children: [_jsx("span", { children: "Options (one per line, use \"Label | value\" for different values)" }), _jsx("textarea", { value: optionsText, onChange: (e) => setOptionsText(e.target.value), onBlur: () => {
                            onChange({ options: textToOptions(optionsText) });
                        }, placeholder: 'Red\nGreen | green\nBlue | blue', rows: 4 })] })), data.answerType === 'free-text' && (_jsxs("label", { className: styles.field, children: [_jsx("span", { children: "Placeholder" }), _jsx("input", { type: "text", value: data.placeholder ?? '', onChange: (e) => onChange({ placeholder: e.target.value || undefined }), placeholder: "e.g. Enter your name\u2026" })] })), data.answerType === 'numeric-stepper' && (_jsxs("div", { className: styles.row, children: [_jsxs("label", { className: styles.field, children: [_jsx("span", { children: "Min" }), _jsx("input", { type: "number", value: data.min ?? 0, onChange: (e) => onChange({ min: Number(e.target.value) }) })] }), _jsxs("label", { className: styles.field, children: [_jsx("span", { children: "Max" }), _jsx("input", { type: "number", value: data.max ?? 100, onChange: (e) => onChange({ max: Number(e.target.value) }) })] }), _jsxs("label", { className: styles.field, children: [_jsx("span", { children: "Step" }), _jsx("input", { type: "number", value: data.step ?? 1, onChange: (e) => onChange({ step: Number(e.target.value) }), min: 0.1, step: 0.1 })] })] })), _jsxs("label", { className: styles.field, children: [_jsx("span", { children: "Default Value" }), _jsx("input", { type: "text", value: data.defaultValue != null ? String(data.defaultValue) : '', onChange: (e) => {
                            const raw = e.target.value;
                            if (raw === '') {
                                onChange({ defaultValue: undefined });
                            }
                            else if (data.answerType === 'numeric-stepper') {
                                onChange({ defaultValue: Number(raw) });
                            }
                            else {
                                onChange({ defaultValue: raw });
                            }
                        }, placeholder: "(none)" })] }), _jsx("div", { className: styles.actions, children: _jsx("button", { className: styles.deleteBtn, onClick: onDelete, children: "\uD83D\uDDD1 Delete Question" }) })] }));
};
