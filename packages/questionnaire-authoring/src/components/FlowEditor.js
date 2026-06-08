import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useCallback, useRef, useEffect } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, SelectionMode, Panel, MarkerType, } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { QuestionNode as QuestionNodeComponent } from './nodes/QuestionNode';
import { StartNode } from './nodes/StartNode';
import { EndNode } from './nodes/EndNode';
import { ConditionEdge } from './edges/ConditionEdge';
import styles from './FlowEditor.module.css';
// ── Custom node/edge type registrations ──────────────────────
const nodeTypes = {
    question: QuestionNodeComponent,
    start: StartNode,
    end: EndNode,
};
const edgeTypes = {
    condition: ConditionEdge,
};
// ── Convert config ↔ xyflow state ────────────────────────────
function configToFlowNodes(config) {
    return config.nodes.map((n) => ({
        id: n.id,
        type: n.type,
        position: n.position,
        data: n.data,
    }));
}
function configToFlowEdges(config) {
    return config.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: 'condition',
        data: e.data,
        animated: !!e.data?.condition,
    }));
}
// ── Component ────────────────────────────────────────────────
export const FlowEditor = ({ config, selectedNodeId, selectedEdgeId, onConfigChange, onNodeSelect, onEdgeSelect, }) => {
    const initialNodes = useMemo(() => configToFlowNodes(config), [config]);
    const initialEdges = useMemo(() => configToFlowEdges(config), [config]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const rfInstanceRef = useRef(null);
    // ── Arrow marker for edge direction ──────────────────────
    const defaultEdgeOptions = useMemo(() => ({
        markerEnd: { type: MarkerType.ArrowClosed, width: 20, height: 20, color: '#64748b' },
    }), []);
    // ── Sync config ↔ xyflow nodes (add/remove/update) ─────
    useEffect(() => {
        setNodes((current) => {
            const configIds = new Set(config.nodes.map((n) => n.id));
            // Remove nodes that no longer exist in config
            let updated = current.filter((n) => configIds.has(n.id));
            // Add new nodes from config that aren't in xyflow yet
            const currentIds = new Set(updated.map((n) => n.id));
            for (const cn of config.nodes) {
                if (!currentIds.has(cn.id)) {
                    updated.push({
                        id: cn.id,
                        type: cn.type,
                        position: cn.position,
                        data: cn.data,
                    });
                }
            }
            // Update data for existing nodes
            updated = updated.map((n) => {
                const configNode = config.nodes.find((cn) => cn.id === n.id);
                if (!configNode)
                    return n;
                const newData = configNode.data;
                const sameData = JSON.stringify(n.data) === JSON.stringify(newData);
                const samePos = n.position.x === configNode.position.x && n.position.y === configNode.position.y;
                if (sameData && samePos)
                    return n;
                return { ...n, data: newData, position: configNode.position };
            });
            return updated;
        });
    }, [config.nodes, setNodes]);
    // ── Sync config ↔ xyflow edges (add/remove/update) ──────
    useEffect(() => {
        setEdges((current) => {
            const configIds = new Set(config.edges.map((e) => e.id));
            // Remove edges that no longer exist in config
            let updated = current.filter((e) => configIds.has(e.id));
            // Add new edges from config that aren't in xyflow yet
            const currentIds = new Set(updated.map((e) => e.id));
            for (const ce of config.edges) {
                if (!currentIds.has(ce.id)) {
                    updated.push({
                        id: ce.id,
                        source: ce.source,
                        target: ce.target,
                        sourceHandle: ce.sourceHandle,
                        targetHandle: ce.targetHandle,
                        type: 'condition',
                        data: ce.data,
                        animated: !!ce.data?.condition,
                    });
                }
            }
            return updated;
        });
    }, [config.edges, setEdges]);
    // ── Sync positions back to config after drag ─────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleNodeDragStop = useCallback((_event, node) => {
        onConfigChange({
            ...config,
            nodes: config.nodes.map((n) => n.id === node.id ? { ...n, position: node.position } : n),
        });
    }, [config, onConfigChange]);
    // ── Connect nodes (draw edge) ─────────────────────────────
    const handleConnect = useCallback((connection) => {
        const newEdge = {
            id: `e-${connection.source}-${connection.target}-${Date.now()}`,
            source: connection.source,
            target: connection.target,
            sourceHandle: connection.sourceHandle ?? undefined,
            targetHandle: connection.targetHandle ?? undefined,
            type: 'condition',
            data: {},
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
    }, [config, onConfigChange, setEdges]);
    // ── Selection ─────────────────────────────────────────────
    const handleSelectionChange = useCallback(({ nodes: selNodes, edges: selEdges }) => {
        if (selNodes.length === 1) {
            onNodeSelect(selNodes[0].id);
        }
        else if (selEdges.length === 1) {
            onEdgeSelect(selEdges[0].id);
        }
        else {
            onNodeSelect(null);
            onEdgeSelect(null);
        }
    }, [onNodeSelect, onEdgeSelect]);
    // ── Pane click: deselect, or double-click to add node ─────
    const lastClickRef = useRef(0);
    /** Shared logic to add a node of the given type at a screen position */
    const addNode = useCallback((clientX, clientY, nodeConfig) => {
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
                data: nodeConfig.data,
            },
        ]);
    }, [config, onConfigChange, setNodes]);
    const addNodeAtPosition = useCallback((clientX, clientY, type) => {
        const instance = rfInstanceRef.current;
        if (!instance)
            return;
        // Convert screen coordinates to flow coordinates (accounts for pan & zoom)
        const { x, y } = instance.screenToFlowPosition({ x: clientX, y: clientY });
        // Offset so the node appears centered under the click/cursor
        const position = { x: x - 75, y: y - 30 };
        const newId = `${type === 'question' ? 'q' : type}-${Date.now()}`;
        let nodeConfig;
        if (type === 'start') {
            nodeConfig = { id: newId, type: 'start', data: {}, position };
        }
        else if (type === 'end') {
            nodeConfig = { id: newId, type: 'end', data: {}, position };
        }
        else {
            nodeConfig = {
                id: newId,
                type: 'question',
                position,
                data: { question: 'New Question', answerType: 'free-text', required: false },
            };
        }
        addNode(clientX, clientY, nodeConfig);
    }, [addNode]);
    const handlePaneClick = useCallback((event) => {
        const now = Date.now();
        const isDoubleClick = now - lastClickRef.current < 300;
        if (isDoubleClick) {
            // Double-click → add a question node here
            lastClickRef.current = 0; // reset
            addNodeAtPosition(event.clientX, event.clientY, 'question');
        }
        else {
            // Single click → deselect
            lastClickRef.current = now;
            onNodeSelect(null);
            onEdgeSelect(null);
        }
    }, [onNodeSelect, onEdgeSelect, addNodeAtPosition]);
    // ── Handle keyboard delete via onNodesChange/onEdgesChange
    const handleNodesChangeWrapped = useCallback((changes) => {
        onNodesChange(changes);
        // Detect node removals → update config
        const removedIds = changes
            .filter((c) => c.type === 'remove')
            .map((c) => c.id);
        if (removedIds.length > 0) {
            const idSet = new Set(removedIds);
            onConfigChange({
                ...config,
                nodes: config.nodes.filter((n) => !idSet.has(n.id)),
                edges: config.edges.filter((e) => !idSet.has(e.source) && !idSet.has(e.target)),
            });
        }
    }, [config, onConfigChange, onNodesChange]);
    const handleEdgesChangeWrapped = useCallback((changes) => {
        onEdgesChange(changes);
        // Detect edge removals → update config
        const removedIds = changes
            .filter((c) => c.type === 'remove')
            .map((c) => c.id);
        if (removedIds.length > 0) {
            const idSet = new Set(removedIds);
            onConfigChange({
                ...config,
                edges: config.edges.filter((e) => !idSet.has(e.id)),
            });
        }
    }, [config, onConfigChange, onEdgesChange]);
    // ── Render ────────────────────────────────────────────────
    return (_jsx("div", { className: styles.editor, children: _jsxs(ReactFlow, { nodes: nodes, edges: edges, onNodesChange: handleNodesChangeWrapped, onEdgesChange: handleEdgesChangeWrapped, onConnect: handleConnect, onNodeDragStop: handleNodeDragStop, onSelectionChange: handleSelectionChange, onPaneClick: handlePaneClick, onInit: (instance) => { rfInstanceRef.current = instance; }, nodeTypes: nodeTypes, edgeTypes: edgeTypes, defaultEdgeOptions: defaultEdgeOptions, fitView: true, selectionMode: SelectionMode.Partial, deleteKeyCode: ['Backspace', 'Delete'], multiSelectionKeyCode: "Shift", children: [_jsx(Background, { gap: 20, size: 1, color: "#cbd5e1" }), _jsx(Controls, {}), _jsx(MiniMap, { nodeStrokeColor: "#4f46e5", nodeColor: "#e0e7ff", maskColor: "rgba(0,0,0,0.08)" }), _jsxs(Panel, { position: "top-left", className: styles.addPanel, children: [_jsx("button", { className: styles.addBtn, onClick: () => {
                                const paneEl = document.querySelector('.react-flow__pane');
                                if (paneEl) {
                                    const bounds = paneEl.getBoundingClientRect();
                                    addNodeAtPosition(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2 - 80, 'start');
                                }
                            }, title: "Add a Start node", children: "\u25B6 Start" }), _jsx("button", { className: styles.addBtn, onClick: () => {
                                const paneEl = document.querySelector('.react-flow__pane');
                                if (paneEl) {
                                    const bounds = paneEl.getBoundingClientRect();
                                    addNodeAtPosition(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, 'question');
                                }
                            }, title: "Add a Question node", children: "\uFF0B Question" }), _jsx("button", { className: styles.addBtnEnd, onClick: () => {
                                const paneEl = document.querySelector('.react-flow__pane');
                                if (paneEl) {
                                    const bounds = paneEl.getBoundingClientRect();
                                    addNodeAtPosition(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2 + 80, 'end');
                                }
                            }, title: "Add an End node", children: "\u23F9 End" })] }), _jsx(Panel, { position: "bottom-left", className: styles.hint, children: "Double-click canvas to add a question \u00B7 Drag handles to connect" })] }) }));
};
