import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import styles from './SpecialNode.module.css';

/**
 * Start node — only a source handle (outgoing).  This is where the
 * questionnaire flow begins.  Not editable as a question.
 */
const StartNodeComponent: React.FC<NodeProps> = ({ selected }) => (
  <div className={`${styles.node} ${styles.start} ${selected ? styles.selected : ''}`}>
    <div className={styles.icon}>▶</div>
    <div className={styles.label}>Start</div>
    <Handle
      type="source"
      position={Position.Bottom}
      id="start-source"
      className={styles.handle}
    />
  </div>
);

export const StartNode = memo(StartNodeComponent);
