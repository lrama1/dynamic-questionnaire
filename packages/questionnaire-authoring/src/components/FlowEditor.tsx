import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  NodeTypes,
  EdgeTypes,
  SelectionMode,
  Panel,
  MarkerType,
  type ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import type {
  QuestionnaireConfig,
  QuestionNodeData,
  QuestionnaireNode,
} from '@lrama1/dynamic-questionnaire-renderer';
import { isQuestionNode } from '@lrama1/dynamic-questionnaire-renderer';
import { QuestionNode as QuestionNodeComponent } from './nodes/QuestionNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { ConditionEdge } from './edges/ConditionEdge';
import styles from './FlowEditor.module.css';

// ── Custom node/edge type registrations ──────────────────────

const nodeTypes: NodeTypes = {
  question: QuestionNodeComponent,
  start: StartNode,
  end: EndNode,
};

const edgeTypes: EdgeTypes = {
  condition: ConditionEdge,
};

// ── Convert config ↔ xyflow state ────────────────────────────

function configToFlowNodes(config: QuestionnaireConfig): Node[] {
  return config.nodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: n.position,
    data: n.data as unknown as Record<string, unknown>,
  }));
}

function configToFlowEdges(config: QuestionnaireConfig): Edge[] {
  return config.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    type: 'condition',
    data: e.data as unknown as Record<string, unknown> | undefined,
    animated: !!e.data?.condition,
  }));
}

// ── Props ────────────────────────────────────────────────────

interface FlowEditorProps {
  config: QuestionnaireConfig;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onConfigChange: (config: QuestionnaireConfig) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onEdgeSelect: (edgeId: string | null) => void;
}

// ── Component ────────────────────────────────────────────────

export const FlowEditor: React.FC<FlowEditorProps> = ({
  config,
  selectedNodeId,
  selectedEdgeId,
  onConfigChange,
  onNodeSelect,
  onEdgeSelect,
}) => {
  const initialNodes = useMemo(() => configToFlowNodes(config), [config]);
  const initialEdges = useMemo(() => configToFlowEdges(config), [config]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const rfInstanceRef = useRef<ReactFlowInstance | null>(null);

  // ── Arrow marker for edge direction ──────────────────────

  const defaultEdgeOptions = useMemo(
    () => ({
      markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#64748b' },
    }),
    [],
  );

  // ── Sync config data → xyflow node data (labels, types, etc.) ─

  useEffect(() => {
    setNodes((current) =>
      current.map((n) => {
        const configNode = config.nodes.find((cn) => cn.id === n.id);
        if (!configNode) return n;
        // Only update if data actually changed (avoid infinite loops)
        const newData = configNode.data as unknown as Record<string, unknown>;
        if (JSON.stringify(n.data) === JSON.stringify(newData)) return n;
        return { ...n, data: newData };
      }),
    );
  }, [config.nodes, setNodes]);

  // ── Sync positions back to config after drag ─────────────

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      onConfigChange({
        ...config,
        nodes: config.nodes.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n,
        ),
      });
    },
    [config, onConfigChange],
  );

  // ── Connect nodes (draw edge) ─────────────────────────────

  const handleConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        type: 'condition',
        data: {} as Record<string, unknown>,
      };

      setEdges((prev) => addEdge(newEdge, prev));

      // Also update config
      onConfigChange({
        ...config,
        edges: [
          ...config.edges,
          {
            id: newEdge.id,
            source: newEdge.source,
            target: newEdge.target,
            sourceHandle: newEdge.sourceHandle ?? undefined,
            targetHandle: newEdge.targetHandle ?? undefined,
            data: undefined,
          },
        ],
      });
    },
    [config, onConfigChange, setEdges],
  );

  // ── Selection ─────────────────────────────────────────────

  const handleSelectionChange = useCallback(
    ({ nodes: selNodes, edges: selEdges }: { nodes: Node[]; edges: Edge[] }) => {
      if (selNodes.length === 1) {
        onNodeSelect(selNodes[0].id);
      } else if (selEdges.length === 1) {
        onEdgeSelect(selEdges[0].id);
      } else {
        onNodeSelect(null);
        onEdgeSelect(null);
      }
    },
    [onNodeSelect, onEdgeSelect],
  );

  // ── Pane click: deselect, or double-click to add node ─────

  const lastClickRef = useRef<number>(0);

  /** Shared logic to add a node of the given type at a screen position */
  const addNode = useCallback(
    (clientX: number, clientY: number, nodeConfig: QuestionnaireNode) => {
      onConfigChange({
        ...config,
        nodes: [...config.nodes, nodeConfig],
      });

      setNodes((prev) => [
        ...prev,
        {
          id: nodeConfig.id,
          type: nodeConfig.type,
          position: nodeConfig.position,
          data: nodeConfig.data as unknown as Record<string, unknown>,
        },
      ]);
    },
    [config, onConfigChange, setNodes],
  );

  const addNodeAtPosition = useCallback(
    (clientX: number, clientY: number, type: QuestionnaireNode['type']) => {
      const instance = rfInstanceRef.current;
      if (!instance) return;
      // Convert screen coordinates to flow coordinates (accounts for pan & zoom)
      const { x, y } = instance.screenToFlowPosition({ x: clientX, y: clientY });
      // Offset so the node appears centered under the click/cursor
      const position = { x: x - 75, y: y - 30 };
      const newId = `${type === 'question' ? 'q' : type}-${Date.now()}`;

      let nodeConfig: QuestionnaireNode;
      if (type === 'start') {
        nodeConfig = { id: newId, type: 'start', data: {}, position };
      } else if (type === 'end') {
        nodeConfig = { id: newId, type: 'end', data: {}, position };
      } else {
        nodeConfig = {
          id: newId,
          type: 'question',
          position,
          data: { question: 'New Question', answerType: 'free-text', required: false },
        };
      }

      addNode(clientX, clientY, nodeConfig);
    },
    [addNode],
  );

  const handlePaneClick = useCallback(
    (event: React.MouseEvent) => {
      const now = Date.now();
      const isDoubleClick = now - lastClickRef.current < 300;

      if (isDoubleClick) {
        // Double-click → add a question node here
        lastClickRef.current = 0; // reset
        addNodeAtPosition(event.clientX, event.clientY, 'question');
      } else {
        // Single click → deselect
        lastClickRef.current = now;
        onNodeSelect(null);
        onEdgeSelect(null);
      }
    },
    [onNodeSelect, onEdgeSelect, addNodeAtPosition],
  );

  // ── Render ────────────────────────────────────────────────

  return (
    <div className={styles.editor}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={handleNodeDragStop}
        onSelectionChange={handleSelectionChange}
        onPaneClick={handlePaneClick}
        onInit={(instance) => { rfInstanceRef.current = instance; }}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        selectionMode={SelectionMode.Partial}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
      >
        <Background gap={20} size={1} color="#cbd5e1" />
        <Controls />
        <MiniMap
          nodeStrokeColor="#4f46e5"
          nodeColor="#e0e7ff"
          maskColor="rgba(0,0,0,0.08)"
        />
        <Panel position="top-left" className={styles.addPanel}>
          <button
            className={styles.addBtn}
            onClick={() => {
              const paneEl = document.querySelector('.react-flow__pane');
              if (paneEl) {
                const bounds = paneEl.getBoundingClientRect();
                addNodeAtPosition(
                  bounds.left + bounds.width / 2,
                  bounds.top + bounds.height / 2 - 80,
                  'start',
                );
              }
            }}
            title="Add a Start node"
          >
            ▶ Start
          </button>
          <button
            className={styles.addBtn}
            onClick={() => {
              const paneEl = document.querySelector('.react-flow__pane');
              if (paneEl) {
                const bounds = paneEl.getBoundingClientRect();
                addNodeAtPosition(
                  bounds.left + bounds.width / 2,
                  bounds.top + bounds.height / 2,
                  'question',
                );
              }
            }}
            title="Add a Question node"
          >
            ＋ Question
          </button>
          <button
            className={styles.addBtnEnd}
            onClick={() => {
              const paneEl = document.querySelector('.react-flow__pane');
              if (paneEl) {
                const bounds = paneEl.getBoundingClientRect();
                addNodeAtPosition(
                  bounds.left + bounds.width / 2,
                  bounds.top + bounds.height / 2 + 80,
                  'end',
                );
              }
            }}
            title="Add an End node"
          >
            ⏹ End
          </button>
        </Panel>
        <Panel position="bottom-left" className={styles.hint}>
          Double-click canvas to add a question · Drag handles to connect
        </Panel>
      </ReactFlow>
    </div>
  );
};
