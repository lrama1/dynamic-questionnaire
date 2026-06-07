import React from 'react';
import type { AnswerValue, OptionItem } from '../../types';

interface CheckboxInputProps {
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  options: OptionItem[];
  disabled?: boolean;
}

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  value,
  onChange,
  options,
  disabled,
}) => {
  const selected: string[] = Array.isArray(value) ? value : [];

  const toggle = (optValue: string) => {
    if (selected.includes(optValue)) {
      onChange(selected.filter((v) => v !== optValue));
    } else {
      onChange([...selected, optValue]);
    }
  };

  return (
    <div className="dq-input dq-input--checkbox-group">
      {options.filter((opt) => opt.label.trim() !== '').map((opt) => (
        <label key={opt.value} className="dq-checkbox-label">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => toggle(opt.value)}
            disabled={disabled}
          />
          <span>{opt.label}</span>
        </label>
      ))}
    </div>
  );
};
