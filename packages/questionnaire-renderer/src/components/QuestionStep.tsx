import React from 'react';
import type { QuestionNodeData, AnswerValue } from '../types';
import { FreeTextInput } from './inputs/FreeTextInput';
import { DropdownInput } from './inputs/DropdownInput';
import { RadioInput } from './inputs/RadioInput';
import { NumericStepperInput } from './inputs/NumericStepperInput';
import { CheckboxInput } from './inputs/CheckboxInput';
import { DateInput } from './inputs/DateInput';
import { BooleanInput } from './inputs/BooleanInput';

interface QuestionStepProps {
  node: QuestionNodeData;
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
}

export const QuestionStep: React.FC<QuestionStepProps> = ({
  node,
  value,
  onChange,
  disabled,
}) => {
  const renderInput = () => {
    switch (node.answerType) {
      case 'free-text':
        return (
          <FreeTextInput
            value={value}
            onChange={onChange}
            placeholder={node.placeholder}
            disabled={disabled}
          />
        );
      case 'dropdown':
        return (
          <DropdownInput
            value={value}
            onChange={onChange}
            options={node.options ?? []}
            placeholder={node.placeholder}
            disabled={disabled}
          />
        );
      case 'radio':
        return (
          <RadioInput
            value={value}
            onChange={onChange}
            options={node.options ?? []}
            disabled={disabled}
          />
        );
      case 'numeric-stepper':
        return (
          <NumericStepperInput
            value={value}
            onChange={onChange}
            min={node.min}
            max={node.max}
            step={node.step}
            disabled={disabled}
          />
        );
      case 'checkbox':
        return (
          <CheckboxInput
            value={value}
            onChange={onChange}
            options={node.options ?? []}
            disabled={disabled}
          />
        );
      case 'date':
        return <DateInput value={value} onChange={onChange} disabled={disabled} />;
      case 'boolean':
        return <BooleanInput value={value} onChange={onChange} disabled={disabled} />;
      default:
        return <p className="dq-unsupported">Unsupported answer type: {node.answerType}</p>;
    }
  };

  return (
    <div className="dq-question-step">
      <h3 className="dq-question-text">
        {node.question}
        {node.required && <span className="dq-required"> *</span>}
      </h3>
      {node.description && (
        <p className="dq-question-description">{node.description}</p>
      )}
      <div className="dq-input-area">{renderInput()}</div>
    </div>
  );
};
