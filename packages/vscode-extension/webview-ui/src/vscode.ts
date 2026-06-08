/**
 * VS Code webview API bridge.
 * All communication with the extension host goes through this module.
 */

const vscodeApi = acquireVsCodeApi();

export interface VscodeMessage {
  type: 'init' | 'update';
  content?: string;
}

let saveTimeout: ReturnType<typeof setTimeout> | null = null;

/** Post the full questionnaire config back to VS Code to save */
export function saveConfig(config: unknown): void {
  // Debounce — rapid successive updates (e.g. node deletion + orphaned edges)
  // would cause "Content is newer" conflicts.  Batch them into one save.
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    console.log('[WEBVIEW] saveConfig, nodes:', (config as any)?.nodes?.length);
    vscodeApi.postMessage({ type: 'update', config });
  }, 50);
}

/** Listen for messages from the extension host */
export function onMessage(handler: (msg: VscodeMessage) => void): () => void {
  const listener = (event: MessageEvent<VscodeMessage>) => {
    handler(event.data);
  };
  window.addEventListener('message', listener);

  // Signal that we're ready to receive data
  vscodeApi.postMessage({ type: 'ready' });

  return () => window.removeEventListener('message', listener);
}
