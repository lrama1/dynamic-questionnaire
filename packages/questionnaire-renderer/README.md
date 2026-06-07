# @lrama1/dynamic-questionnaire-renderer

React component for rendering dynamic, conditional questionnaires from a JSON configuration file.

## Install

```bash
npm install @lrama1/dynamic-questionnaire-renderer
```

## Quick Start

```tsx
import { QuestionnaireRenderer } from '@lrama1/dynamic-questionnaire-renderer';
import '@lrama1/dynamic-questionnaire-renderer/styles';

const config = {
  id: 'survey-1',
  title: 'Customer Feedback',
  nodes: [
    {
      id: 'q1',
      type: 'question',
      data: {
        question: 'How satisfied are you?',
        answerType: 'radio',
        required: true,
        options: [
          { label: 'Very Satisfied', value: 'very' },
          { label: 'Somewhat', value: 'somewhat' },
          { label: 'Not at all', value: 'not' },
        ],
      },
      position: { x: 250, y: 100 },
    },
    {
      id: 'end',
      type: 'end',
      data: {},
      position: { x: 250, y: 300 },
    },
  ],
  edges: [
    {
      id: 'e1',
      source: 'q1',
      target: 'end',
    },
  ],
};

function App() {
  return (
    <QuestionnaireRenderer
      config={config}
      onComplete={(answers) => console.log('Done!', answers)}
    />
  );
}
```

## Answer Types

| Type | Description |
|---|---|
| `free-text` | Single-line text input |
| `dropdown` | Select from a dropdown list |
| `radio` | Single-choice radio buttons |
| `numeric-stepper` | Increment/decrement with configurable min, max, and step |
| `checkbox` | Multi-select checkboxes |
| `date` | Native date picker |
| `boolean` | Yes / No toggle |

## Options with Separate Label and Value

For `dropdown`, `radio`, and `checkbox` types, each option can have a display label and a stored value:

```json
{
  "options": [
    { "label": "United States", "value": "US" },
    { "label": "Canada", "value": "CA" }
  ]
}
```

If label and value are the same, just use the string shorthand:

```json
{
  "options": [
    { "label": "Red", "value": "Red" },
    { "label": "Green", "value": "Green" }
  ]
}
```

## Conditional Branching

Edges can have conditions that control which question comes next based on previous answers:

```json
{
  "edges": [
    {
      "id": "e1",
      "source": "q1",
      "target": "q2",
      "data": {
        "condition": {
          "field": "q1",
          "operator": "equals",
          "value": "very"
        }
      }
    }
  ]
}
```

### Supported Operators

| Operator | Description |
|---|---|
| `equals` | Exact match |
| `notEquals` | Not equal |
| `contains` | String contains |
| `notContains` | String does not contain |
| `greaterThan` | Numeric greater than |
| `lessThan` | Numeric less than |
| `greaterThanOrEqual` | Numeric greater or equal |
| `lessThanOrEqual` | Numeric less or equal |
| `isEmpty` | Answer is empty |
| `notEmpty` | Answer is not empty |
| `in` | Value is in a list |
| `notIn` | Value is not in a list |

### Compound Conditions

Combine multiple conditions with AND/OR logic:

```json
{
  "condition": {
    "logic": "AND",
    "conditions": [
      { "field": "q1", "operator": "equals", "value": "yes" },
      { "field": "q2", "operator": "greaterThan", "value": "18" }
    ]
  }
}
```

## Start and End Nodes

Optionally use `"type": "start"` and `"type": "end"` nodes to clearly mark the beginning and end of the questionnaire flow. The renderer auto-advances past the Start node and completes when reaching an End node. If omitted, the first question node is treated as the start.

## API

### `<QuestionnaireRenderer>`

| Prop | Type | Required | Description |
|---|---|---|---|
| `config` | `QuestionnaireConfig` | ✓ | The questionnaire JSON configuration |
| `onComplete` | `(answers: Record<string, AnswerValue>) => void` | — | Called when the questionnaire is finished |
| `onAnswerChange` | `(questionId: string, value: AnswerValue) => void` | — | Called on every answer change |
| `initialAnswers` | `Record<string, AnswerValue>` | — | Pre-fill answers (e.g. restore saved progress) |
| `className` | `string` | — | Additional CSS class on the wrapper |

### Exports

```tsx
// Component
import { QuestionnaireRenderer } from '@lrama1/dynamic-questionnaire-renderer';

// Utilities
import {
  evaluateCondition,
  getNextNodeId,
  isQuestionNode,
  isStartNode,
  isEndNode,
} from '@lrama1/dynamic-questionnaire-renderer';

// Types
import type {
  QuestionnaireConfig,
  QuestionnaireRendererProps,
  QuestionnaireNode,
  QuestionNode,
  QuestionNodeData,
  StartNode,
  EndNode,
  OptionItem,
  EdgeCondition,
  SimpleCondition,
  CompoundCondition,
  AnswerType,
  AnswerValue,
  ComparisonOperator,
} from '@lrama1/dynamic-questionnaire-renderer';
```

## Styling

Import the bundled CSS for default styling:

```tsx
import '@lrama1/dynamic-questionnaire-renderer/styles';
```

All class names are prefixed with `dq-` for easy overrides:

```css
.dq-renderer { max-width: 800px; }
.dq-btn--next { background: #your-color; }
```

## Authoring Tool

This package is the **renderer** — the component that displays a questionnaire. To visually **author** questionnaires with a drag-and-drop interface, see the companion [dynamic-questionnaire](https://github.com/lrama1/dynamic-questionnaire) monorepo.

## License

MIT
