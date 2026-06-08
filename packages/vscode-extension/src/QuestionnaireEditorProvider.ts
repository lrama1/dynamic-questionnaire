import * as vscode from 'vscode';

export class QuestionnaireEditorProvider implements vscode.CustomTextEditorProvider {
  constructor(private readonly context: vscode.ExtensionContext) {}

  async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken,
  ): Promise<void> {
    console.log('[DQ] resolveCustomTextEditor:', document.uri.toString());

    const fileUri = document.uri;

    webviewPanel.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview'),
      ],
    };

    const indexUri = vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview', 'index.html');
    const baseUri = webviewPanel.webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, 'dist', 'webview'),
    );
    const baseStr = baseUri.toString().replace(/\/?$/, '/');
    console.log('[DQ] Base URI:', baseStr);

    let html = Buffer.from(await vscode.workspace.fs.readFile(indexUri)).toString('utf-8');
    html = html.replace(/(src|href)="\.\/assets\//g, `$1="${baseStr}assets/`);

    // Register message listener BEFORE setting HTML
    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      console.log('[DQ] Message:', message.type);
      switch (message.type) {
        case 'update': {
          const content = JSON.stringify(message.config, null, 2);
          // Try WorkspaceEdit first (shows dirty indicator, user saves manually)
          const edit = new vscode.WorkspaceEdit();
          edit.replace(
            document.uri,
            new vscode.Range(0, 0, document.lineCount, 0),
            content,
          );
          const applied = await vscode.workspace.applyEdit(edit);
          console.log('[DQ] WorkspaceEdit applied:', applied, 'chars:', content.length);
          // Fallback: write directly to disk if WorkspaceEdit fails
          if (!applied) {
            await vscode.workspace.fs.writeFile(fileUri, Buffer.from(content, 'utf-8'));
            console.log('[DQ] Fallback: wrote to disk directly');
          }
          break;
        }
        case 'ready':
          try {
            const bytes = await vscode.workspace.fs.readFile(fileUri);
            const content = Buffer.from(bytes).toString('utf-8');
            console.log('[DQ] Sending init, length:', content.length);
            // If the file is empty, provide a default config so the editor has something to start with
            if (!content || content.trim() === '') {
              const defaultConfig = JSON.stringify({
                id: 'new-questionnaire',
                title: 'Untitled Questionnaire',
                nodes: [
                  { id: 'start', type: 'start', data: {}, position: { x: 250, y: 50 } },
                  { id: 'end', type: 'end', data: {}, position: { x: 250, y: 400 } },
                ],
                edges: [],
              }, null, 2);
              // Write the default back so the file isn't empty anymore
              await vscode.workspace.fs.writeFile(fileUri, Buffer.from(defaultConfig, 'utf-8'));
              webviewPanel.webview.postMessage({ type: 'init', content: defaultConfig });
            } else {
              webviewPanel.webview.postMessage({ type: 'init', content });
            }
          } catch (err) {
            console.error('[DQ] Read error:', err);
            webviewPanel.webview.postMessage({ type: 'init', content: '{}' });
          }
          break;
      }
    });

    webviewPanel.webview.html = html;
    console.log('[DQ] Webview HTML set');
  }
}
