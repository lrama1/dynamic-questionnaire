import React, { useState, useEffect } from 'react';
import type {
  QuestionNode,
  QuestionNodeData,
  AnswerType,
  OptionItem,
} from '@lrama1/dynamic-questionnaire-renderer';
import styles from './QuestionConfigPanel.module.css';

// ── Option parsing helpers ───────────────────────────────────

/**
 * Convert an array of OptionItem back to the textarea format.
 * `Label | value` if they differ, otherwise just `Label`.
 */
function optionsToText(opts: OptionItem[]): string {
  return opts
    .map((o) => (o.label !== o.value ? `${o.label} | ${o.value}` : o.label))
    .join('\n');
}

/**
 * Parse textarea lines into OptionItem[].
 * Lines with `|` are split into label/value; otherwise label = value.
 * Empty lines are kept as-is so the textarea doesn't eat the line
 * the user just created — consumers should filter by non-empty label.
 */
function textToOptions(text: string): OptionItem[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .map((line) => {
      if (line === '') {
        return { label: '', value: '' };
      }
      const pipeIdx = line.indexOf('|');
      if (pipeIdx === -1) {
        return { label: line, value: line };
      }
      const label = line.slice(0, pipeIdx).trim();
      const value = line.slice(pipeIdx + 1).trim();
      return {
        label: label || value || line,
        value: value || label || line,
      };
    });
}

interface QuestionConfigPanelProps {
  node: QuestionNode;
  onChange: (data: Partial<QuestionNodeData>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const ANSWER_TYPES: { value: AnswerType; label: string }[] = [
  { value: 'free-text', label: 'Free Text' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'radio', label: 'Radio Buttons' },
  { value: 'numeric-stepper', label: 'Numeric Stepper' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'date', label: 'Date Picker' },
  { value: 'boolean', label: 'Yes / No' },
];

export const QuestionConfigPanel: React.FC<QuestionConfigPanelProps> = ({
  node,
  onChange,
  onDelete,
  onClose,
}) => {
  const { data } = node;

  // ── Local state for the options textarea ──────────────────
  // We keep the raw text in local state so the user can type
  // freely (including | and newlines) without the controlled
  // roundtrip fighting them.  Parsing → OptionItem[] happens on blur.

  const [optionsText, setOptionsText] = useState(() =>
    optionsToText(data.options ?? []),
  );

  // Reset local text when switching to a different node
  useEffect(() => {
    setOptionsText(optionsToText(data.options ?? []));
  }, [node.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Question Settings</h3>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {/* Question text */}
      <label className={styles.field}>
        <span>Question Text</span>
        <input
          type="text"
          value={data.question}
          onChange={(e) => onChange({ question: e.target.value })}
          placeholder="Enter your question…"
        />
      </label>

      {/* Description */}
      <label className={styles.field}>
        <span>Description (optional)</span>
        <textarea
          value={data.description ?? ''}
          onChange={(e) => onChange({ description: e.target.value || undefined })}
          placeholder="Additional context…"
          rows={2}
        />
      </label>

      {/* Answer type */}
      <label className={styles.field}>
        <span>Answer Type</span>
        <select
          value={data.answerType}
          onChange={(e) => onChange({ answerType: e.target.value as AnswerType })}
        >
          {ANSWER_TYPES.map((at) => (
            <option key={at.value} value={at.value}>
              {at.label}
            </option>
          ))}
        </select>
      </label>

      {/* Required toggle */}
      <label className={styles.checkField}>
        <input
          type="checkbox"
          checked={data.required ?? false}
          onChange={(e) => onChange({ required: e.target.checked })}
        />
        <span>Required</span>
      </label>

      {/* Options – for dropdown, radio, checkbox */}
      {(data.answerType === 'dropdown' ||
        data.answerType === 'radio' ||
        data.answerType === 'checkbox') && (
        <div className={styles.field}>
          <span>Options (one per line, use "Label | value" for different values)</span>
          <textarea
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            onBlur={() => {
              onChange({ options: textToOptions(optionsText) });
            }}
            placeholder={'Red\nGreen | green\nBlue | blue'}
            rows={4}
          />
        </div>
      )}

      {/* Placeholder – for free-text */}
      {data.answerType === 'free-text' && (
        <label className={styles.field}>
          <span>Placeholder</span>
          <input
            type="text"
            value={data.placeholder ?? ''}
            onChange={(e) =>
              onChange({ placeholder: e.target.value || undefined })
            }
            placeholder="e.g. Enter your name…"
          />
        </label>
      )}

      {/* Numeric stepper constraints */}
      {data.answerType === 'numeric-stepper' && (
        <div className={styles.row}>
          <label className={styles.field}>
            <span>Min</span>
            <input
              type="number"
              value={data.min ?? 0}
              onChange={(e) => onChange({ min: Number(e.target.value) })}
            />
          </label>
          <label className={styles.field}>
            <span>Max</span>
            <input
              type="number"
              value={data.max ?? 100}
              onChange={(e) => onChange({ max: Number(e.target.value) })}
            />
          </label>
          <label className={styles.field}>
            <span>Step</span>
            <input
              type="number"
              value={data.step ?? 1}
              onChange={(e) => onChange({ step: Number(e.target.value) })}
              min={0.1}
              step={0.1}
            />
          </label>
        </div>
      )}

      {/* Default value */}
      <label className={styles.field}>
        <span>Default Value</span>
        <input
          type="text"
          value={data.defaultValue != null ? String(data.defaultValue) : ''}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === '') {
              onChange({ defaultValue: undefined });
            } else if (data.answerType === 'numeric-stepper') {
              onChange({ defaultValue: Number(raw) });
            } else {
              onChange({ defaultValue: raw });
            }
          }}
          placeholder="(none)"
        />
      </label>

      {/* Delete */}
      <div className={styles.actions}>
        <button className={styles.deleteBtn} onClick={onDelete}>
          🗑 Delete Question
        </button>
      </div>
    </div>
  );
};
