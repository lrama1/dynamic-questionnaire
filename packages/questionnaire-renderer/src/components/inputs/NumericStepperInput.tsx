import React from 'react';
import type { AnswerValue } from '../../types';

interface NumericStepperInputProps {
  value: AnswerValue;
  onChange: (value: AnswerValue) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const NumericStepperInput: React.FC<NumericStepperInputProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
}) => {
  const numValue = Number(value ?? min);

  const decrement = () => {
    const next = Math.max(min, numValue - step);
    onChange(next);
  };

  const increment = () => {
    const next = Math.min(max, numValue + step);
    onChange(next);
  };

  return (
    <div className="dq-input dq-input--stepper">
      <button
        type="button"
        className="dq-stepper-btn"
        onClick={decrement}
        disabled={disabled || numValue <= min}
        aria-label="Decrement"
      >
        −
      </button>
      <span className="dq-stepper-value">{numValue}</span>
      <button
        type="button"
        className="dq-stepper-btn"
        onClick={increment}
        disabled={disabled || numValue >= max}
        aria-label="Increment"
      >
        +
      </button>
    </div>
  );
};
