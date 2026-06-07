import React from 'react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  title: string;
  onTitleChange: (title: string) => void;
  onNew: () => void;
  onExport: () => void;
  onImport: () => void;
  onPreview: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  title,
  onTitleChange,
  onNew,
  onExport,
  onImport,
  onPreview,
}) => {
  return (
    <header className={styles.toolbar}>
      <div className={styles.left}>
        <span className={styles.logo}>⚡ DQ</span>
        <input
          type="text"
          className={styles.titleInput}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Questionnaire Title"
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.btn} onClick={onNew} title="New questionnaire">
          📄 New
        </button>
        <button className={styles.btn} onClick={onImport} title="Import JSON">
          📥 Import
        </button>
        <button className={styles.btn} onClick={onExport} title="Export JSON">
          📤 Export
        </button>
        <div className={styles.divider} />
        <button
          className={`${styles.btn} ${styles.previewBtn}`}
          onClick={onPreview}
          title="Preview questionnaire"
        >
          ▶ Preview
        </button>
      </div>
    </header>
  );
};
