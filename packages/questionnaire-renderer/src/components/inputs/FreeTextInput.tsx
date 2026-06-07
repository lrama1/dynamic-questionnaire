import React from 'react';
import type { AnswerValue } from '../../types';

interface FreeTextInputProps {
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const FreeTextInput: React.FC<FreeTextInputProps> = ({
  value,
  onChange,
  placeholder,
  disabled,
}) => (
  <input
    type="text"
    className="dq-input dq-input--text"
    value={String(value ?? '')}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    disabled={disabled}
  />
);
