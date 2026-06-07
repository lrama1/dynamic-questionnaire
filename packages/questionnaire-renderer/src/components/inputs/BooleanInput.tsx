import React from 'react';
import type { AnswerValue } from '../../types';

interface BooleanInputProps {
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
}

export const BooleanInput: React.FC<BooleanInputProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <div className="dq-input dq-input--boolean">
    <label className="dq-boolean-label">
      <input
        type="radio"
        name="dq-bool"
        checked={value === true}
        onChange={() => onChange(true)}
        disabled={disabled}
      />
      <span>Yes</span>
    </label>
    <label className="dq-boolean-label">
      <input
        type="radio"
        name="dq-bool"
        checked={value === false}
        onChange={() => onChange(false)}
        disabled={disabled}
      />
      <span>No</span>
    </label>
  </div>
);
