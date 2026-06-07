# Dynamic Questionnaire

A monorepo for authoring and rendering dynamic questionnaires with conditional branching logic.

## Packages

| Package | Description |
|---|---|
| [`@dynamic-questionnaire/renderer`](./packages/questionnaire-renderer) | React component that renders a questionnaire from a JSON config. Publishable to npm. |
| [`@dynamic-questionnaire/authoring`](./packages/questionnaire-authoring) | Graphical editor built with [@xyflow/react](https://xyflow.com) for drag-and-drop questionnaire authoring. |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the authoring tool (opens at http://localhost:3000)
pnpm dev

# Build both packages
pnpm build
```

## Questionnaire JSON Format

```jsonc
{
  "id": "my-questionnaire",
  "title": "Customer Survey",
  "nodes": [
    {
      "id": "q1",
      "type": "question",
      "data": {
        "question": "How satisfied are you?",
        "answerType": "radio",      // free-text | dropdown | radio | numeric-stepper | checkbox | date | boolean
        "required": true,
        "options": ["Very", "Somewhat", "Not at all"]
      },
      "position": { "x": 250, "y": 100 }
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "q1",
      "target": "q2",
      "data": {
        "condition": {
          "field": "q1",            // source question id to evaluate
          "operator": "equals",     // equals | notEquals | contains | greaterThan | isEmpty | in | ...
          "value": "Very"           // compared value
        }
      }
    }
  ]
}
```

### Supported Answer Types

- **free-text** — single-line text input
- **dropdown** — select from a list
- **radio** — single-choice radio buttons
- **numeric-stepper** — increment/decrement with min/max/step
- **checkbox** — multi-select checkboxes
- **date** — date picker
- **boolean** — Yes/No toggle

### Edge Conditions

Edges can have **simple conditions** (compare one question's answer) or **compound conditions** (AND/OR combinations). Edges without conditions are always followed.

## Using the Renderer in Another Project

```bash
npm install @dynamic-questionnaire/renderer
```

```tsx
import { QuestionnaireRenderer } from '@dynamic-questionnaire/renderer';
import '@dynamic-questionnaire/renderer/styles';

function App() {
  const config = { /* your questionnaire JSON */ };

  return (
    <QuestionnaireRenderer
      config={config}
      onComplete={(answers) => console.log('Done!', answers)}
    />
  );
}
```

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Language**: TypeScript
- **Build**: Vite (library mode for renderer, app mode for authoring)
- **Graph Editor**: @xyflow/react (React Flow)
- **Styling**: CSS Modules (authoring) + plain CSS with BEM naming (renderer)
