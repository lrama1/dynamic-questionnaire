import React from 'react';
import type { AnswerValue } from '../types';

interface NavigationButtonsProps {
  onNext: () => void;
  onBack: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  nextLabel?: string;
  backLabel?: string;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  onNext,
  onBack,
  canGoBack,
  canGoNext,
  nextLabel = 'Next',
  backLabel = 'Back',
}) => (
  <div className="dq-navigation">
    {canGoBack && (
      <button type="button" className="dq-btn dq-btn--back" onClick={onBack}>
        ← {backLabel}
      </button>
    )}
    <div className="dq-navigation__spacer" />
    <button
      type="button"
      className="dq-btn dq-btn--next"
      onClick={onNext}
      disabled={!canGoNext}
    >
      {nextLabel} →
    </button>
  </div>
);
