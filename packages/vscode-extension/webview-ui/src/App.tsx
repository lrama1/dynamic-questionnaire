import React, { useState, useCallback, useEffect, useRef } from 'react';
import type {
  QuestionnaireConfig,
  QuestionNodeData,
  EdgeCondition,
  QuestionnaireNode,
} from '@lrama1/dynamic-questionnaire-renderer';
import { isQuestionNode } from '@lrama1/dynamic-questionnaire-renderer';
import { FlowEditor } from '@dq-authoring/components/FlowEditor';
import { QuestionConfigPanel } from '@dq-authoring/components/panels/QuestionConfigPanel';
import { EdgeConditionPanel } from '@dq-authoring/components/panels/EdgeConditionPanel';
import { onMessage, saveConfig } from './vscode';

const DEFAULT_CONFIG: QuestionnaireConfig = {
  id: 'new-questionnaire',
  title: 'Untitled Questionnaire',
  nodes: [
    { id: 'start', type: 'start', data: {}, position: { x: 250, y: 50 } },
    { id: 'end', type: 'end', data: {}, position: { x: 250, y: 400 } },
  ],
  edges: [],
};

const App: React.FC = () => {
  const [config, setConfig] = useState<QuestionnaireConfig>(DEFAULT_CONFIG);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  const mainAreaRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // ── VS Code communication ────────────────────────────────

  useEffect(() => {
    return onMessage((msg) => {
      if (msg.type === 'init' && msg.content) {
        try {
          const parsed = JSON.parse(msg.content) as QuestionnaireConfig;
          setConfig(parsed);
          initializedRef.current = true;
        } catch {
          // Invalid JSON — stay with current config
        }
      }
    });
  }, []);

  // ── Auto-save to VS Code on every config change ──────────

  const handleConfigChange = useCallback(
    (newConfig: QuestionnaireConfig) => {
      setConfig(newConfig);
      saveConfig(newConfig);
    },
    [],
  );

  // ── Mutations ────────────────────────────────────────────

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<QuestionNodeData>) => {
      setConfig((prev) => {
        const next = {
          ...prev,
          nodes: prev.nodes.map((n) =>
            n.id === nodeId && isQuestionNode(n)
              ? { ...n, data: { ...n.data, ...data } }
              : n,
          ),
        };
        saveConfig(next);
        return next;
      });
    },
    [],
  );

  const updateEdgeCondition = useCallback(
    (edgeId: string, condition: EdgeCondition | undefined) => {
      setConfig((prev) => {
        const next = {
          ...prev,
          edges: prev.edges.map((e) =>
            e.id === edgeId
              ? { ...e, data: { ...e.data, condition } }
              : e,
          ),
        };
        saveConfig(next);
        return next;
      });
    },
    [],
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      setConfig((prev) => {
        const next = {
          ...prev,
          nodes: prev.nodes.filter((n) => n.id !== nodeId),
          edges: prev.edges.filter(
            (e) => e.source !== nodeId && e.target !== nodeId,
          ),
        };
        saveConfig(next);
        return next;
      });
      setSelectedNodeId(null);
    },
    [],
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setConfig((prev) => {
        const next = {
          ...prev,
          edges: prev.edges.filter((e) => e.id !== edgeId),
        };
        saveConfig(next);
        return next;
      });
      setSelectedEdgeId(null);
    },
    [],
  );

  // ── Selection ────────────────────────────────────────────

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    setSelectedEdgeId(null);
  }, []);

  const handleEdgeSelect = useCallback((edgeId: string | null) => {
    setSelectedEdgeId(edgeId);
    setSelectedNodeId(null);
  }, []);

  // ── Resize sidebar ───────────────────────────────────────

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
      setSidebarWidth(Math.max(240, Math.min(600, mainRight - e.clientX)));
    };
    const handleMouseUp = () => setIsResizing(false);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
    };
  }, [isResizing]);

  // ── Selected objects ─────────────────────────────────────

  const selectedNode: QuestionnaireNode | null = selectedNodeId
    ? config.nodes.find((n) => n.id === selectedNodeId) ?? null
    : null;

  const selectedEdge = selectedEdgeId
    ? config.edges.find((e) => e.id === selectedEdgeId) ?? null
    : null;

  // ── Render ───────────────────────────────────────────────

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }} ref={mainAreaRef}>
        <div style={{ flex: 1, position: 'relative' }}>
          <FlowEditor
            config={config}
            selectedNodeId={selectedNodeId}
            selectedEdgeId={selectedEdgeId}
            onConfigChange={handleConfigChange}
            onNodeSelect={handleNodeSelect}
            onEdgeSelect={handleEdgeSelect}
          />
        </div>

        <div
          style={{
            width: 6,
            cursor: 'col-resize',
            flexShrink: 0,
            background: isResizing ? '#4f46e5' : 'transparent',
            transition: 'background 0.15s',
          }}
          onMouseDown={handleResizeStart}
        />

        <aside
          style={{
            width: sidebarWidth,
            background: 'var(--vscode-editor-background, #fff)',
            borderLeft: '1px solid var(--vscode-panel-border, #e2e8f0)',
            overflowY: 'auto',
            flexShrink: 0,
            color: 'var(--vscode-editor-foreground, #1e293b)',
          }}
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
              <div style={{ padding: 16, textAlign: 'center' }}>
                <p style={{ marginBottom: 8 }}>
                  <strong>
                    {selectedNode.type === 'start' ? '▶ Start Node' : '⏹ End Node'}
                  </strong>
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--vscode-descriptionForeground, #94a3b8)' }}>
                  {selectedNode.type === 'start'
                    ? 'The questionnaire flow begins here.'
                    : 'The questionnaire ends here.'}
                </p>
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  style={{
                    marginTop: 16,
                    padding: '8px 16px',
                    border: '1px solid #fecaca',
                    borderRadius: 6,
                    background: '#fef2f2',
                    color: '#dc2626',
                    cursor: 'pointer',
                  }}
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: 24,
                color: 'var(--vscode-descriptionForeground, #94a3b8)',
                textAlign: 'center',
                fontSize: '0.9rem',
              }}
            >
              <p>
                Select a node to edit its question,
                <br />
                or an edge to configure its condition.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default App;
