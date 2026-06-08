import { jsx as _jsx } from "react/jsx-runtime";
export const FreeTextInput = ({ value, onChange, placeholder, disabled, }) => (_jsx("input", { type: "text", className: "dq-input dq-input--text", value: String(value ?? ''), onChange: (e) => onChange(e.target.value), placeholder: placeholder, disabled: disabled }));
