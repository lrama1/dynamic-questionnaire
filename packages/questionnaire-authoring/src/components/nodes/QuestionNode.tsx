import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { QuestionNodeData, OptionItem } from '@dynamic-questionnaire/renderer';
import styles from './QuestionNode.module.css';

const ANSWER_TYPE_LABELS: Record<string, string> = {
  'free-text': 'ABC',
  dropdown: '▼',
  radio: '◉',
  'numeric-stepper': '±',
  checkbox: '☑',
  date: '📅',
  boolean: 'Y/N',
};

const QuestionNodeComponent: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as QuestionNodeData;
  const badge = ANSWER_TYPE_LABELS[nodeData.answerType] ?? '?';
  const visibleOptions: OptionItem[] = (nodeData.options ?? []).filter(
    (o) => o.label.trim() !== '',
  );

  return (
    <div
      className={`${styles.node} ${selected ? styles.selected : ''}`}
    >
      {/* Handles – connections on all four sides */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className={styles.handle}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className={styles.handle}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        className={styles.handle}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        className={styles.handle}
      />

      <div className={styles.body}>
        <div className={styles.header}>
          <span className={styles.badge} title={nodeData.answerType}>
            {badge}
          </span>
          <span className={styles.typeLabel}>{nodeData.answerType}</span>
          {nodeData.required && (
            <span className={styles.required} title="Required">
              *
            </span>
          )}
        </div>
        <p className={styles.questionText}>
          {nodeData.question || 'Untitled Question'}
        </p>
        {nodeData.description && (
          <p className={styles.description}>{nodeData.description}</p>
        )}
        {visibleOptions.length > 0 && (
          <div className={styles.options}>
            {visibleOptions.slice(0, 3).map((opt) => (
              <span key={opt.value} className={styles.optionTag}>
                {opt.label}
              </span>
            ))}
            {visibleOptions.length > 3 && (
              <span className={styles.optionTag}>
                +{visibleOptions.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export const QuestionNode = memo(QuestionNodeComponent);
