import React, { useState, useCallback, useMemo, useEffect } from 'react';
import type {
  QuestionnaireConfig,
  AnswerValue,
  QuestionnaireRendererProps,
  QuestionnaireNode,
} from '../types';
import { isQuestionNode, isEndNode } from '../types';
import { getNextNodeId } from '../utils/evaluate';
import { QuestionStep } from './QuestionStep';
import { NavigationButtons } from './NavigationButtons';
import './renderer.css';

/**
 * QuestionnaireRenderer walks the configured question graph and renders
 * one question at a time, evaluating edge conditions to determine the
 * next step.  It can be embedded in any React 18+ app.
 */
export const QuestionnaireRenderer: React.FC<QuestionnaireRendererProps> = ({
  config,
  onComplete,
  onAnswerChange,
  initialAnswers = {},
  className,
}) => {
  const nodesById = useMemo(() => {
    const map = new Map<string, QuestionnaireNode>(config.nodes.map((n) => [n.id, n]));
    return map;
  }, [config.nodes]);

  // Find the Start node, or fall back to the first question node
  const startNodeId = useMemo(() => {
    const start = config.nodes.find((n) => n.type === 'start');
    if (start) return start.id;
    // Fallback: first question node
    const firstQ = config.nodes.find((n) => isQuestionNode(n));
    return firstQ?.id;
  }, [config.nodes]);

  const [history, setHistory] = useState<string[]>(() =>
    startNodeId ? [startNodeId] : [],
  );
  const [answers, setAnswers] =
    useState<Record<string, AnswerValue>>(initialAnswers);
  const [completed, setCompleted] = useState(false);

  const currentNodeId = history[history.length - 1];
  const currentNode = currentNodeId ? nodesById.get(currentNodeId) : undefined;

  // ── Auto-advance past Start node ──────────────────────────

  useEffect(() => {
    if (currentNode && currentNode.type === 'start') {
      const nextId = getNextNodeId(currentNode.id, config.edges, answers);
      if (nextId && nodesById.has(nextId)) {
        setHistory((prev) => [...prev, nextId]);
      }
    }
  }, [currentNode, config.edges, answers, nodesById]);

  const handleAnswer = useCallback(
    (value: AnswerValue) => {
      if (!currentNodeId) return;
      setAnswers((prev) => ({ ...prev, [currentNodeId]: value }));
      onAnswerChange?.(currentNodeId, value);
    },
    [currentNodeId, onAnswerChange],
  );

  const handleNext = useCallback(() => {
    if (!currentNodeId) return;

    const nextId = getNextNodeId(currentNodeId, config.edges, answers);
    if (!nextId || !nodesById.has(nextId)) {
      setCompleted(true);
      onComplete?.(answers);
      return;
    }

    const nextNode = nodesById.get(nextId)!;
    // If next is an End node, complete immediately
    if (isEndNode(nextNode)) {
      setCompleted(true);
      onComplete?.(answers);
      return;
    }

    setHistory((prev) => [...prev, nextId]);
  }, [currentNodeId, config.edges, answers, nodesById, onComplete]);

  const handleBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      // Drop the current node, then keep dropping until we land on a question node
      const remaining = [...prev];
      remaining.pop(); // remove current
      while (remaining.length > 0) {
        const node = nodesById.get(remaining[remaining.length - 1]);
        if (node && isQuestionNode(node)) break;
        remaining.pop();
      }
      // Ensure there's at least one node left (the start or first question)
      return remaining.length > 0 ? remaining : prev.slice(0, 1);
    });
  }, [nodesById]);

  // ── Completion screen ──────────────────────────────────────
  if (completed) {
    return (
      <div className={`dq-renderer dq-completed ${className ?? ''}`}>
        <div className="dq-completed-card">
          <h2>✓ Questionnaire Complete</h2>
          <p>Thank you for your responses.</p>
        </div>
      </div>
    );
  }

  // ── Guard: only render question nodes ────────────────────
  if (!currentNode || !isQuestionNode(currentNode)) {
    return (
      <div className={`dq-renderer dq-empty ${className ?? ''}`}>
        <p>No questions configured.</p>
      </div>
    );
  }

  const currentValue = answers[currentNodeId];
  const isRequired = currentNode.data.required ?? false;
  const canGoNext = !isRequired || (currentValue !== null && currentValue !== undefined && currentValue !== '');
  const canGoBack = history.length > 1;

  // ── Progress indicator ──────────────────────────────────────
  const progressPct = config.nodes.length > 0
    ? Math.round((history.length / config.nodes.length) * 100)
    : 0;

  return (
    <div className={`dq-renderer ${className ?? ''}`}>
      {/* Progress bar */}
      <div className="dq-progress">
        <div
          className="dq-progress-bar"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <h2 className="dq-title">{config.title}</h2>
      {config.description && (
        <p className="dq-description">{config.description}</p>
      )}

      <QuestionStep
        node={currentNode.data}
        value={currentValue}
        onChange={handleAnswer}
      />

      <NavigationButtons
        onNext={handleNext}
        onBack={handleBack}
        canGoBack={canGoBack}
        canGoNext={canGoNext}
      />
    </div>
  );
};
