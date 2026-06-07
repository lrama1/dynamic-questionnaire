import React from 'react';
import type { AnswerValue, OptionItem } from '../../types';

interface DropdownInputProps {
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  options: OptionItem[];
  placeholder?: string;
  disabled?: boolean;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled,
}) => (
  <select
    className="dq-input dq-input--dropdown"
    value={String(value ?? '')}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
  >
    <option value="">{placeholder || '-- Select --'}</option>
    {options.filter((opt) => opt.label.trim() !== '').map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);
