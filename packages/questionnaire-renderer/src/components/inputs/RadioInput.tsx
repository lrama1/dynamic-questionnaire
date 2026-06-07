import React from 'react';
import type { AnswerValue, OptionItem } from '../../types';

interface RadioInputProps {
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  options: OptionItem[];
  disabled?: boolean;
}

export const RadioInput: React.FC<RadioInputProps> = ({
  value,
  onChange,
  options,
  disabled,
}) => (
  <div className="dq-input dq-input--radio-group">
    {options.filter((opt) => opt.label.trim() !== '').map((opt) => (
      <label key={opt.value} className="dq-radio-label">
        <input
          type="radio"
          name="dq-radio"
          value={opt.value}
          checked={value === opt.value}
          onChange={() => onChange(opt.value)}
          disabled={disabled}
        />
        <span>{opt.label}</span>
      </label>
    ))}
  </div>
);
