// ── Answer Types ──────────────────────────────────────────────

export type AnswerType =
  | 'free-text'
  | 'dropdown'
  | 'radio'
  | 'numeric-stepper'
  | 'checkbox'
  | 'date'
  | 'boolean';

// ── Question Node ─────────────────────────────────────────────

/** A single selectable option with separate display label and stored value. */
export interface OptionItem {
  label: string;
  value: string;
}

export interface QuestionNodeData {
  question: string;
  description?: string;
  answerType: AnswerType;
  required?: boolean;
  /** Dropdown / Radio / Checkbox options */
  options?: OptionItem[];
  /** Numeric stepper constraints */
  min?: number;
  max?: number;
  step?: number;
  /** Free-text placeholder */
  placeholder?: string;
  /** Default / pre-filled value */
  defaultValue?: AnswerValue;
}

export interface QuestionNode {
  id: string;
  type: 'question';
  data: QuestionNodeData;
  position: { x: number; y: number };
}

// ── Start / End Nodes ─────────────────────────────────────────

export interface StartNode {
  id: string;
  type: 'start';
  data: { label?: string };
  position: { x: number; y: number };
}

export interface EndNode {
  id: string;
  type: 'end';
  data: { label?: string };
  position: { x: number; y: number };
}

/** Any node that can appear in a questionnaire graph. */
export type QuestionnaireNode = QuestionNode | StartNode | EndNode;

// ── Type guards ────────────────────────────────────────────────

export function isQuestionNode(node: QuestionnaireNode): node is QuestionNode {
  return node.type === 'question';
}

export function isStartNode(node: QuestionnaireNode): node is StartNode {
  return node.type === 'start';
}

export function isEndNode(node: QuestionnaireNode): node is EndNode {
  return node.type === 'end';
}

// ── Condition Operators ────────────────────────────────────────

export type ComparisonOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'notEmpty'
  | 'in'
  | 'notIn';

export interface SimpleCondition {
  field: string;        // source question id
  operator: ComparisonOperator;
  value?: AnswerValue;  // compared value (not needed for isEmpty / notEmpty)
}

export type LogicalOperator = 'AND' | 'OR';

export interface CompoundCondition {
  logic: LogicalOperator;
  conditions: EdgeCondition[];
}

export type EdgeCondition = SimpleCondition | CompoundCondition;

// ── Edge ───────────────────────────────────────────────────────

export interface EdgeData {
  label?: string;
  condition?: EdgeCondition;
}

export interface QuestionnaireEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  data?: EdgeData;
}

// ── Answer Value ───────────────────────────────────────────────

export type AnswerValue = string | number | boolean | string[] | null | undefined;

// ── Questionnaire Config ───────────────────────────────────────

export interface QuestionnaireConfig {
  id: string;
  title: string;
  description?: string;
  nodes: QuestionnaireNode[];
  edges: QuestionnaireEdge[];
  /** Optional custom CSS class names to apply */
  className?: string;
}

// ── Renderer Props ─────────────────────────────────────────────

export interface QuestionnaireRendererProps {
  config: QuestionnaireConfig;
  /** Called when the questionnaire is completed with all answers */
  onComplete?: (answers: Record<string, AnswerValue>) => void;
  /** Called whenever an answer changes */
  onAnswerChange?: (questionId: string, value: AnswerValue) => void;
  /** External answer overrides (e.g. restoring saved progress) */
  initialAnswers?: Record<string, AnswerValue>;
  /** Custom class name for the wrapper */
  className?: string;
}
