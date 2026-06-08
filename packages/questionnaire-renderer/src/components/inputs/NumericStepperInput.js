import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const NumericStepperInput = ({ value, onChange, min = 0, max = 100, step = 1, disabled, }) => {
    const numValue = Number(value ?? min);
    const decrement = () => {
        const next = Math.max(min, numValue - step);
        onChange(next);
    };
    const increment = () => {
        const next = Math.min(max, numValue + step);
        onChange(next);
    };
    return (_jsxs("div", { className: "dq-input dq-input--stepper", children: [_jsx("button", { type: "button", className: "dq-stepper-btn", onClick: decrement, disabled: disabled || numValue <= min, "aria-label": "Decrement", children: "\u2212" }), _jsx("span", { className: "dq-stepper-value", children: numValue }), _jsx("button", { type: "button", className: "dq-stepper-btn", onClick: increment, disabled: disabled || numValue >= max, "aria-label": "Increment", children: "+" })] }));
};
