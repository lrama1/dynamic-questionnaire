import * as vscode from 'vscode';
import { QuestionnaireEditorProvider } from './QuestionnaireEditorProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('[DQ Editor] Extension activated');

  // Register custom editor for .dq.json files
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(
      'dynamic-questionnaire.editor',
      new QuestionnaireEditorProvider(context),
      {
        supportsMultipleEditorsPerDocument: false,
      },
    ),
  );

  // Command: New Questionnaire
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'dynamic-questionnaire.newQuestionnaire',
      async () => {
        const uri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file('questionnaire.dq.json'),
          filters: { 'Questionnaire': ['dq.json'] },
        });
        if (!uri) return;

        const defaultConfig = {
          id: 'new-questionnaire',
          title: 'Untitled Questionnaire',
          nodes: [
            { id: 'start', type: 'start', data: {}, position: { x: 250, y: 50 } },
            { id: 'end', type: 'end', data: {}, position: { x: 250, y: 400 } },
          ],
          edges: [],
        };

        await vscode.workspace.fs.writeFile(
          uri,
          Buffer.from(JSON.stringify(defaultConfig, null, 2), 'utf-8'),
        );
        await vscode.commands.executeCommand('vscode.openWith', uri, 'dynamic-questionnaire.editor');
      },
    ),
  );
}

export function deactivate() {}
