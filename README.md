# Dynamic Questionnaire

A monorepo for authoring and rendering dynamic questionnaires with conditional branching logic.

## Packages

| Package | Description |
|---|---|
| [`@lrama1/dynamic-questionnaire-renderer`](./packages/questionnaire-renderer) | React component that renders a questionnaire from a JSON config. Publishable to npm. |
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
npm install @lrama1/dynamic-questionnaire-renderer
```

```tsx
import { QuestionnaireRenderer } from '@lrama1/dynamic-questionnaire-renderer';
import '@lrama1/dynamic-questionnaire-renderer/styles';

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

## Publishing to npm

The `@lrama1/dynamic-questionnaire-renderer` package is configured for publishing to the public npm registry.

### Prerequisites

1. A free [npm](https://www.npmjs.com) account
2. Two-factor authentication (2FA) enabled on your npm account (required for writes)

### One-time Setup

```bash
# Log in to npm (follow the browser prompts)
npm login

# Verify you're logged in
npm whoami
```

> **Note:** If your npm account uses 2FA (highly recommended), you'll need to provide a one-time password during login and publish. Automation tokens can be used in CI — see [npm docs on access tokens](https://docs.npmjs.com/creating-and-viewing-access-tokens).

### Publishing a New Version

```bash
# 1. Ensure everything builds cleanly
pnpm build

# 2. Bump the version (patch, minor, or major)
cd packages/questionnaire-renderer
pnpm version patch    # 0.1.0 → 0.1.1 (bug fixes)
# pnpm version minor  # 0.1.0 → 0.2.0 (new features, backward-compatible)
# pnpm version major  # 0.1.0 → 1.0.0 (breaking changes)

# 3. Publish to the public registry
pnpm publish --access public
```

### What Gets Published

The `"files"` field in `packages/questionnaire-renderer/package.json` controls what's included:

- `dist/` — JavaScript bundles (ESM + CJS), CSS, and TypeScript declarations
- `package.json` — always included
- `README.md` — always included

The `"prepublishOnly"` script runs `pnpm build` automatically, so the published package always contains a fresh build.

### Scoped Package Name

The package is published under the `@dynamic-questionnaire` scope. If you want to publish under a different scope or your own username, update the `"name"` field in `packages/questionnaire-renderer/package.json` before publishing:

```json
{
  "name": "@your-username/questionnaire-renderer"
}
```

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Language**: TypeScript
- **Build**: Vite (library mode for renderer, app mode for authoring)
- **Graph Editor**: @xyflow/react (React Flow)
- **Styling**: CSS Modules (authoring) + plain CSS with BEM naming (renderer)
