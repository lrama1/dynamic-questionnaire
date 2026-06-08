import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, } from '@xyflow/react';
function describeCondition(condition) {
    if (!condition)
        return '';
    if ('field' in condition && 'operator' in condition) {
        const sc = condition;
        const field = sc.field;
        const op = sc.operator;
        const val = sc.value != null ? String(sc.value) : '';
        switch (op) {
            case 'equals':
                return `${field} = ${val}`;
            case 'notEquals':
                return `${field} ≠ ${val}`;
            case 'contains':
                return `${field} contains "${val}"`;
            case 'greaterThan':
                return `${field} > ${val}`;
            case 'lessThan':
                return `${field} < ${val}`;
            case 'greaterThanOrEqual':
                return `${field} ≥ ${val}`;
            case 'lessThanOrEqual':
                return `${field} ≤ ${val}`;
            case 'isEmpty':
                return `${field} is empty`;
            case 'notEmpty':
                return `${field} is not empty`;
            case 'in':
                return `${field} in [${val}]`;
            case 'notIn':
                return `${field} not in [${val}]`;
            default:
                return `${field} ${op} ${val}`;
        }
    }
    if ('logic' in condition) {
        return `${condition.logic} (${condition.conditions.length})`;
    }
    return '?';
}
export const ConditionEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, selected, markerEnd, }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    const conditionText = describeCondition(data?.condition);
    return (_jsxs(_Fragment, { children: [_jsx(BaseEdge, { id: id, path: edgePath, markerEnd: markerEnd, style: {
                    stroke: selected ? '#4f46e5' : '#94a3b8',
                    strokeWidth: selected ? 2.5 : 1.5,
                    strokeDasharray: data?.condition ? undefined : '5,5',
                } }), _jsx(EdgeLabelRenderer, { children: _jsx("div", { style: {
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                        pointerEvents: 'all',
                    }, className: "nodrag nopan", children: conditionText ? (_jsx("span", { style: {
                            background: selected ? '#eef2ff' : '#f8fafc',
                            border: `1px solid ${selected ? '#4f46e5' : '#cbd5e1'}`,
                            borderRadius: 4,
                            padding: '2px 8px',
                            fontSize: '0.7rem',
                            color: '#475569',
                            whiteSpace: 'nowrap',
                        }, children: conditionText })) : (_jsx("span", { style: {
                            fontSize: '0.65rem',
                            color: '#94a3b8',
                            fontStyle: 'italic',
                        }, children: "(always)" })) }) })] }));
};
