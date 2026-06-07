// Public API – everything consumers need
export { QuestionnaireRenderer } from './components/QuestionnaireRenderer';
export { evaluateCondition, getNextNodeId } from './utils/evaluate';
export type {
  QuestionnaireConfig,
  QuestionnaireRendererProps,
  QuestionnaireNode,
  QuestionNode,
  QuestionNodeData,
  StartNode,
  EndNode,
  OptionItem,
  QuestionnaireEdge,
  EdgeData,
  EdgeCondition,
  SimpleCondition,
  CompoundCondition,
  AnswerType,
  AnswerValue,
  ComparisonOperator,
  LogicalOperator,
} from './types';
export { isQuestionNode, isStartNode, isEndNode } from './types';
