import React from 'react';
import type { AnswerValue } from '../../types';

interface DateInputProps {
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  disabled?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  disabled,
}) => (
  <input
    type="date"
    className="dq-input dq-input--date"
    value={String(value ?? '')}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
  />
);
