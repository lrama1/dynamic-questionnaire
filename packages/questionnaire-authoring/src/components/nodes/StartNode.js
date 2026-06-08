import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from './SpecialNode.module.css';
/**
 * Start node — only a source handle (outgoing).  This is where the
 * questionnaire flow begins.  Not editable as a question.
 */
const StartNodeComponent = ({ selected }) => (_jsxs("div", { className: `${styles.node} ${styles.start} ${selected ? styles.selected : ''}`, children: [_jsx("div", { className: styles.icon, children: "\u25B6" }), _jsx("div", { className: styles.label, children: "Start" }), _jsx(Handle, { type: "source", position: Position.Bottom, id: "start-source", className: styles.handle })] }));
export const StartNode = memo(StartNodeComponent);
