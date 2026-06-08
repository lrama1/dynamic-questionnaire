import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import styles from './SpecialNode.module.css';
/**
 * End node — only a target handle (incoming).  Reaching this node
 * means the questionnaire is complete.  Not editable as a question.
 */
const EndNodeComponent = ({ selected }) => (_jsxs("div", { className: `${styles.node} ${styles.end} ${selected ? styles.selected : ''}`, children: [_jsx(Handle, { type: "target", position: Position.Top, id: "end-target", className: styles.handle }), _jsx("div", { className: styles.icon, children: "\u23F9" }), _jsx("div", { className: styles.label, children: "End" })] }));
export const EndNode = memo(EndNodeComponent);
