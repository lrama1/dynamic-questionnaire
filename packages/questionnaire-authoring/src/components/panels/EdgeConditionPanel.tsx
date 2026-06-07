import React from 'react';
import type {
  QuestionnaireEdge,
  QuestionnaireNode,
  EdgeCondition,
  SimpleCondition,
  CompoundCondition,
  ComparisonOperator,
  LogicalOperator,
} from '@dynamic-questionnaire/renderer';
import { isQuestionNode } from '@dynamic-questionnaire/renderer';
import styles from './EdgeConditionPanel.module.css';

interface EdgeConditionPanelProps {
  edge: QuestionnaireEdge;
  nodes: QuestionnaireNode[];
  onChange: (condition: EdgeCondition | undefined) => void;
  onDelete: () => void;
  onClose: () => void;
}

const OPERATORS: { value: ComparisonOperator; label: string }[] = [
  { value: 'equals', label: 'equals' },
  { value: 'notEquals', label: 'not equals' },
  { value: 'contains', label: 'contains' },
  { value: 'notContains', label: 'does not contain' },
  { value: 'greaterThan', label: 'greater than' },
  { value: 'lessThan', label: 'less than' },
  { value: 'greaterThanOrEqual', label: 'greater or equal' },
  { value: 'lessThanOrEqual', label: 'less or equal' },
  { value: 'isEmpty', label: 'is empty' },
  { value: 'notEmpty', label: 'is not empty' },
  { value: 'in', label: 'in list' },
  { value: 'notIn', label: 'not in list' },
];

function isSimple(c: EdgeCondition): c is SimpleCondition {
  return 'field' in c && 'operator' in c;
}

function isCompound(c: EdgeCondition): c is CompoundCondition {
  return 'logic' in c && 'conditions' in c;
}

const EMPTY_SIMPLE: SimpleCondition = {
  field: '',
  operator: 'equals',
  value: '',
};

export const EdgeConditionPanel: React.FC<EdgeConditionPanelProps> = ({
  edge,
  nodes,
  onChange,
  onDelete,
  onClose,
}) => {
  const condition = edge.data?.condition;

  // ── Simple condition editor ───────────────────────────────

  const handleSimpleChange = (partial: Partial<SimpleCondition>) => {
    if (condition && isSimple(condition)) {
      onChange({ ...condition, ...partial });
    } else {
      onChange({ ...EMPTY_SIMPLE, ...partial });
    }
  };

  // ── Toggle simple / compound ─────────────────────────────

  const handleToggleMode = () => {
    if (!condition || isSimple(condition)) {
      // Switch to compound
      onChange({
        logic: 'AND',
        conditions: condition ? [condition] : [],
      });
    } else {
      // Switch to simple (take first sub-condition or empty)
      const first = (condition as CompoundCondition).conditions[0];
      onChange(first ?? undefined);
    }
  };

  // ── Compound condition helpers ────────────────────────────

  const handleAddSubCondition = () => {
    const compound = (condition as CompoundCondition) ?? {
      logic: 'AND' as LogicalOperator,
      conditions: [],
    };
    onChange({
      ...compound,
      conditions: [...compound.conditions, { ...EMPTY_SIMPLE }],
    });
  };

  const handleSubConditionChange = (index: number, sub: EdgeCondition) => {
    if (condition && isCompound(condition)) {
      const updated = [...condition.conditions];
      updated[index] = sub;
      onChange({ ...condition, conditions: updated });
    }
  };

  const handleRemoveSubCondition = (index: number) => {
    if (condition && isCompound(condition)) {
      const updated = condition.conditions.filter((_, i) => i !== index);
      if (updated.length === 0) {
        onChange(undefined); // no condition
      } else {
        onChange({ ...condition, conditions: updated });
      }
    }
  };

  const handleLogicToggle = () => {
    if (condition && isCompound(condition)) {
      onChange({
        ...condition,
        logic: condition.logic === 'AND' ? 'OR' : 'AND',
      });
    }
  };

  // ── Remove condition entirely ─────────────────────────────

  const handleRemoveCondition = () => {
    onChange(undefined);
  };

  // ── Render simple condition ───────────────────────────────

  const renderSimpleCondition = (sc: SimpleCondition, onChangeSc: (c: SimpleCondition) => void, showRemove?: boolean) => {
    // Look up the source node to see if it has predefined options (question nodes only)
    const sourceNode = nodes.find((n) => n.id === sc.field);
    const questionSource = sourceNode && isQuestionNode(sourceNode) ? sourceNode : null;
    const sourceOptions = questionSource?.data.options ?? [];
    const hasPredefinedOptions =
      questionSource != null &&
      (questionSource.data.answerType === 'dropdown' ||
        questionSource.data.answerType === 'radio' ||
        questionSource.data.answerType === 'checkbox') &&
      sourceOptions.filter((o) => o.label.trim() !== '').length > 0;

    return (
    <div className={styles.conditionRow}>
      <select
        value={sc.field}
        onChange={(e) => onChangeSc({ ...sc, field: e.target.value, value: '' })}
        className={styles.select}
      >
        <option value="">-- select source --</option>
        {nodes
          .filter((n) => n.id !== edge.target)
          .map((n) => (
            <option key={n.id} value={n.id}>
              {isQuestionNode(n) ? (n.data.question || n.id) : (n.type === 'start' ? '▶ Start' : '⏹ End')}
            </option>
          ))}
      </select>

      <select
        value={sc.operator}
        onChange={(e) =>
          onChangeSc({
            ...sc,
            operator: e.target.value as ComparisonOperator,
          })
        }
        className={styles.select}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>
            {op.label}
          </option>
        ))}
      </select>

      {sc.operator !== 'isEmpty' && sc.operator !== 'notEmpty' && (
        hasPredefinedOptions ? (
          <select
            value={sc.value != null ? String(sc.value) : ''}
            onChange={(e) => onChangeSc({ ...sc, value: e.target.value })}
            className={styles.select}
          >
            <option value="">-- select value --</option>
            {sourceOptions
              .filter((o) => o.label.trim() !== '')
              .map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
          </select>
        ) : (
          <input
            type="text"
            value={sc.value != null ? String(sc.value) : ''}
            onChange={(e) => onChangeSc({ ...sc, value: e.target.value })}
            placeholder="value"
            className={styles.input}
          />
        )
      )}

      {showRemove && (
        <button
          className={styles.removeSubBtn}
          onClick={() => onChangeSc(EMPTY_SIMPLE)}
          title="Remove sub-condition"
        >
          ✕
        </button>
      )}
    </div>
    );
  };

  // ── Render compound condition ─────────────────────────────

  const renderCompoundCondition = (cc: CompoundCondition) => (
    <div>
      <div className={styles.logicRow}>
        <span className={styles.logicLabel}>Combine with:</span>
        <button
          className={`${styles.logicBtn} ${
            cc.logic === 'AND' ? styles.logicActive : ''
          }`}
          onClick={handleLogicToggle}
        >
          AND
        </button>
        <button
          className={`${styles.logicBtn} ${
            cc.logic === 'OR' ? styles.logicActive : ''
          }`}
          onClick={handleLogicToggle}
        >
          OR
        </button>
      </div>

      {cc.conditions.map((sub, idx) => (
        <div key={idx} className={styles.subCondition}>
          <span className={styles.subIndex}>#{idx + 1}</span>
          {isSimple(sub) ? (
            renderSimpleCondition(
              sub,
              (updated) => handleSubConditionChange(idx, updated),
              false,
            )
          ) : (
            <div className={styles.nestedNote}>Nested compound not supported</div>
          )}
          <button
            className={styles.removeSubBtn}
            onClick={() => handleRemoveSubCondition(idx)}
          >
            ✕
          </button>
        </div>
      ))}

      <button className={styles.addSubBtn} onClick={handleAddSubCondition}>
        + Add Condition
      </button>
    </div>
  );

  // ── Main render ───────────────────────────────────────────

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Edge Condition</h3>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      <div className={styles.info}>
        <span className={styles.edgeLabel}>
          {edge.source} → {edge.target}
        </span>
      </div>

      {condition ? (
        <>
          <div className={styles.modeRow}>
            <span>Mode:</span>
            <button className={styles.modeBtn} onClick={handleToggleMode}>
              {isSimple(condition) ? 'Simple (click for AND/OR)' : 'Compound (click for simple)'}
            </button>
            <button
              className={styles.removeConditionBtn}
              onClick={handleRemoveCondition}
            >
              Remove
            </button>
          </div>

          {isSimple(condition)
            ? renderSimpleCondition(condition, (c) => onChange(c))
            : renderCompoundCondition(condition as CompoundCondition)}
        </>
      ) : (
        <div className={styles.noCondition}>
          <p>No condition – this edge is always followed.</p>
          <button
            className={styles.addConditionBtn}
            onClick={() => onChange({ ...EMPTY_SIMPLE })}
          >
            + Add Condition
          </button>
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.deleteBtn} onClick={onDelete}>
          🗑 Delete Edge
        </button>
      </div>
    </div>
  );
};
