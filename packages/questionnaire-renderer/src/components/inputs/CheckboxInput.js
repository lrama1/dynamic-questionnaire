import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const CheckboxInput = ({ value, onChange, options, disabled, }) => {
    const selected = Array.isArray(value) ? value : [];
    const toggle = (optValue) => {
        if (selected.includes(optValue)) {
            onChange(selected.filter((v) => v !== optValue));
        }
        else {
            onChange([...selected, optValue]);
        }
    };
    return (_jsx("div", { className: "dq-input dq-input--checkbox-group", children: options.filter((opt) => opt.label.trim() !== '').map((opt) => (_jsxs("label", { className: "dq-checkbox-label", children: [_jsx("input", { type: "checkbox", checked: selected.includes(opt.value), onChange: () => toggle(opt.value), disabled: disabled }), _jsx("span", { children: opt.label })] }, opt.value))) }));
};
