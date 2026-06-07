import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import styles from './SpecialNode.module.css';

/**
 * End node — only a target handle (incoming).  Reaching this node
 * means the questionnaire is complete.  Not editable as a question.
 */
const EndNodeComponent: React.FC<NodeProps> = ({ selected }) => (
  <div className={`${styles.node} ${styles.end} ${selected ? styles.selected : ''}`}>
    <Handle
      type="target"
      position={Position.Top}
      id="end-target"
      className={styles.handle}
    />
    <div className={styles.icon}>⏹</div>
    <div className={styles.label}>End</div>
  </div>
);

export const EndNode = memo(EndNodeComponent);
