import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { FreeTextInput } from './inputs/FreeTextInput';
import { DropdownInput } from './inputs/DropdownInput';
import { RadioInput } from './inputs/RadioInput';
import { NumericStepperInput } from './inputs/NumericStepperInput';
import { CheckboxInput } from './inputs/CheckboxInput';
import { DateInput } from './inputs/DateInput';
import { BooleanInput } from './inputs/BooleanInput';
export const QuestionStep = ({ node, value, onChange, disabled, }) => {
    const renderInput = () => {
        switch (node.answerType) {
            case 'free-text':
                return (_jsx(FreeTextInput, { value: value, onChange: onChange, placeholder: node.placeholder, disabled: disabled }));
            case 'dropdown':
                return (_jsx(DropdownInput, { value: value, onChange: onChange, options: node.options ?? [], placeholder: node.placeholder, disabled: disabled }));
            case 'radio':
                return (_jsx(RadioInput, { value: value, onChange: onChange, options: node.options ?? [], disabled: disabled }));
            case 'numeric-stepper':
                return (_jsx(NumericStepperInput, { value: value, onChange: onChange, min: node.min, max: node.max, step: node.step, disabled: disabled }));
            case 'checkbox':
                return (_jsx(CheckboxInput, { value: value, onChange: onChange, options: node.options ?? [], disabled: disabled }));
            case 'date':
                return _jsx(DateInput, { value: value, onChange: onChange, disabled: disabled });
            case 'boolean':
                return _jsx(BooleanInput, { value: value, onChange: onChange, disabled: disabled });
            default:
                return _jsxs("p", { className: "dq-unsupported", children: ["Unsupported answer type: ", node.answerType] });
        }
    };
    return (_jsxs("div", { className: "dq-question-step", children: [_jsxs("h3", { className: "dq-question-text", children: [node.question, node.required && _jsx("span", { className: "dq-required", children: " *" })] }), node.description && (_jsx("p", { className: "dq-question-description", children: node.description })), _jsx("div", { className: "dq-input-area", children: renderInput() })] }));
};
