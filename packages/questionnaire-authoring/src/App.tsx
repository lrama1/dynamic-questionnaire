import React, { useState, useCallback, useRef, useEffect } from 'react';
import type {
  QuestionnaireConfig,
  QuestionNodeData,
  EdgeCondition,
  QuestionnaireNode,
} from '@lrama1/dynamic-questionnaire-renderer';
import { QuestionnaireRenderer, isQuestionNode } from '@lrama1/dynamic-questionnaire-renderer';
import { FlowEditor } from './components/FlowEditor';
import { Toolbar } from './components/Toolbar';
import { QuestionConfigPanel } from './components/panels/QuestionConfigPanel';
import { EdgeConditionPanel } from './components/panels/EdgeConditionPanel';
import styles from './App.module.css';

const EMPTY_CONFIG: QuestionnaireConfig = {
  id: 'new-questionnaire',
  title: 'Untitled Questionnaire',
  nodes: [
    { id: 'start', type: 'start', data: {}, position: { x: 250, y: 50 } },
    { id: 'end', type: 'end', data: {}, position: { x: 250, y: 400 } },
  ],
  edges: [],
};

const App: React.FC = () => {
  const [config, setConfig] = useState<QuestionnaireConfig>(EMPTY_CONFIG);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Resizable sidebar ─────────────────────────────────────

  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  const mainAreaRef = useRef<HTMLDivElement>(null);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const mainEl = mainAreaRef.current;
      if (!mainEl) return;
      const mainRight = mainEl.getBoundingClientRect().right;
      const newWidth = Math.max(240, Math.min(600, mainRight - e.clientX));
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    // Prevent text selection while dragging
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  // ── Config mutations ──────────────────────────────────────

  const updateConfig = useCallback((patch: Partial<QuestionnaireConfig>) => {
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<QuestionNodeData>) => {
      setConfig((prev) => ({
        ...prev,
        nodes: prev.nodes.map((n) =>
          n.id === nodeId && isQuestionNode(n)
            ? { ...n, data: { ...n.data, ...data } }
            : n,
        ),
      }));
    },
    [],
  );

  const updateEdgeCondition = useCallback(
    (edgeId: string, condition: EdgeCondition | undefined) => {
      setConfig((prev) => ({
        ...prev,
        edges: prev.edges.map((e) =>
          e.id === edgeId
            ? { ...e, data: { ...e.data, condition } }
            : e,
        ),
      }));
    },
    [],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setConfig((prev) => ({
        ...prev,
        nodes: prev.nodes.filter((n) => n.id !== nodeId),
        edges: prev.edges.filter(
          (e) => e.source !== nodeId && e.target !== nodeId,
        ),
      }));
      setSelectedNodeId(null);
    },
    [],
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setConfig((prev) => ({
        ...prev,
        edges: prev.edges.filter((e) => e.id !== edgeId),
      }));
      setSelectedEdgeId(null);
    },
    [],
  );

  // ── Import / Export ───────────────────────────────────────

  const handleExport = useCallback(() => {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${config.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [config]);

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result as string) as QuestionnaireConfig;
          setConfig(imported);
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
        } catch {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
      // Reset so the same file can be re-imported
      e.target.value = '';
    },
    [],
  );

  const handleNew = useCallback(() => {
    if (confirm('Discard current questionnaire?')) {
      setConfig({ ...EMPTY_CONFIG, id: `questionnaire-${Date.now()}` });
      setSelectedNodeId(null);
      setSelectedEdgeId(null);
    }
  }, []);

  // ── Selection handlers ────────────────────────────────────

  const handleNodeSelect = useCallback(
    (nodeId: string | null) => {
      setSelectedNodeId(nodeId);
      setSelectedEdgeId(null);
    },
    [],
  );

  const handleEdgeSelect = useCallback(
    (edgeId: string | null) => {
      setSelectedEdgeId(edgeId);
      setSelectedNodeId(null);
    },
    [],
  );

  // ── Selected objects ──────────────────────────────────────

  const selectedNode: QuestionnaireNode | null = selectedNodeId
    ? config.nodes.find((n) => n.id === selectedNodeId) ?? null
    : null;

  const selectedEdge = selectedEdgeId
    ? config.edges.find((e) => e.id === selectedEdgeId) ?? null
    : null;

  // ── Preview mode ──────────────────────────────────────────

  if (isPreview) {
    return (
      <div className={styles.previewWrapper}>
        <button
          className={styles.exitPreviewBtn}
          onClick={() => setIsPreview(false)}
        >
          ← Back to Editor
        </button>
        <QuestionnaireRenderer config={config} />
      </div>
    );
  }

  // ── Editor ────────────────────────────────────────────────

  return (
    <div className={styles.app}>
      <Toolbar
        title={config.title}
        onTitleChange={(t) => updateConfig({ title: t })}
        onNew={handleNew}
        onExport={handleExport}
        onImport={() => fileInputRef.current?.click()}
        onPreview={() => setIsPreview(true)}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleImport}
      />

      <div className={styles.mainArea} ref={mainAreaRef}>
        <div className={styles.canvasArea}>
          <FlowEditor
            config={config}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onConfigChange={setConfig}
            onNodeSelect={handleNodeSelect}
            onEdgeSelect={handleEdgeSelect}
          />
        </div>

        {/* Resize handle */}
        <div
          className={`${styles.resizeHandle} ${isResizing ? styles.resizeHandleActive : ''}`}
          onMouseDown={handleResizeStart}
        />

        {/* Right sidebar */}
        <aside
          className={styles.sidebar}
          style={{ width: sidebarWidth }}
        >
          {selectedNode ? (
            isQuestionNode(selectedNode) ? (
              <QuestionConfigPanel
                node={selectedNode}
                onChange={(data) => updateNodeData(selectedNode.id, data)}
                onDelete={() => deleteNode(selectedNode.id)}
                onClose={() => handleNodeSelect(null)}
              />
            ) : (
              <div className={styles.sidebarEmpty}>
                <p>
                  <strong>{selectedNode.type === 'start' ? '▶ Start Node' : '⏹ End Node'}</strong>
                </p>
                <p>
                  {selectedNode.type === 'start'
                    ? 'The questionnaire flow begins here. Connect it to your first question.'
                    : 'The questionnaire ends here. Connect your last question to this node.'}
                </p>
                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteNode(selectedNode.id)}
                  style={{ marginTop: 16 }}
                >
                  🗑 Delete Node
                </button>
              </div>
            )
          ) : selectedEdge ? (
            <EdgeConditionPanel
              edge={selectedEdge}
              nodes={config.nodes}
              onChange={(condition) =>
                updateEdgeCondition(selectedEdge.id, condition)
              }
              onDelete={() => deleteEdge(selectedEdge.id)}
              onClose={() => handleEdgeSelect(null)}
            />
          ) : (
            <div className={styles.sidebarEmpty}>
              <p>Select a node to edit its question,<br />or an edge to configure its condition.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default App;
