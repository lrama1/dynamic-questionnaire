import { jsx as _jsx } from "react/jsx-runtime";
export const DateInput = ({ value, onChange, disabled, }) => (_jsx("input", { type: "date", className: "dq-input dq-input--date", value: String(value ?? ''), onChange: (e) => onChange(e.target.value), disabled: disabled }));
