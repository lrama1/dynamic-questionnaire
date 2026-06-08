import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from './QuestionNode.module.css';
const ANSWER_TYPE_LABELS = {
    'free-text': 'ABC',
    dropdown: '▼',
    radio: '◉',
    'numeric-stepper': '±',
    checkbox: '☑',
    date: '📅',
    boolean: 'Y/N',
};
const QuestionNodeComponent = ({ data, selected }) => {
    const nodeData = data;
    const badge = ANSWER_TYPE_LABELS[nodeData.answerType] ?? '?';
    const visibleOptions = (nodeData.options ?? []).filter((o) => o.label.trim() !== '');
    return (_jsxs("div", { className: `${styles.node} ${selected ? styles.selected : ''}`, children: [_jsx(Handle, { type: "target", position: Position.Top, id: "top-target", className: styles.handle }), _jsx(Handle, { type: "source", position: Position.Bottom, id: "bottom-source", className: styles.handle }), _jsx(Handle, { type: "target", position: Position.Left, id: "left-target", className: styles.handle }), _jsx(Handle, { type: "source", position: Position.Right, id: "right-source", className: styles.handle }), _jsxs("div", { className: styles.body, children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.badge, title: nodeData.answerType, children: badge }), _jsx("span", { className: styles.typeLabel, children: nodeData.answerType }), nodeData.required && (_jsx("span", { className: styles.required, title: "Required", children: "*" }))] }), _jsx("p", { className: styles.questionText, children: nodeData.question || 'Untitled Question' }), nodeData.description && (_jsx("p", { className: styles.description, children: nodeData.description })), visibleOptions.length > 0 && (_jsxs("div", { className: styles.options, children: [visibleOptions.slice(0, 3).map((opt) => (_jsx("span", { className: styles.optionTag, children: opt.label }, opt.value))), visibleOptions.length > 3 && (_jsxs("span", { className: styles.optionTag, children: ["+", visibleOptions.length - 3] }))] }))] })] }));
};
export const QuestionNode = memo(QuestionNodeComponent);
