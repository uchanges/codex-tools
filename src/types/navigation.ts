export type Page =
  | 'dashboard'
  | 'manual'
  | 'api-relay'
  | 'overview'
  | 'antigravity-usage'
  | 'codex'
  | 'claude'
  | 'claude-cli'
  | 'codex-api-service'
  | 'zed'
  | 'github-copilot'
  | 'windsurf'
  | 'kiro'
  | 'cursor'
  | 'grok'
  | 'codebuddy'
  | 'codebuddy-cn'
  | 'qoder'
  | 'zcode'
  | 'trae'
  | 'trae-solo'
  | 'trae-cn'
  | 'trae-solo-cn'
  | 'workbuddy'
  | 'workbuddy_ai'
  | 'minimaxcode'
  | 'codex-instances'
  | 'instances'
  | 'accounts'
  | 'wakeup'
  | 'verification'
  | '2fa'
  | 'settings';

/** Pages that tray / floating-card restore may navigate to after main-window recreate. */
export const MAIN_WINDOW_NAVIGABLE_PAGES: readonly Page[] = [
  'dashboard',
  'overview',
  'antigravity-usage',
  'codex',
  'codex-api-service',
  'instances',
  'wakeup',
  'verification',
  '2fa',
  'manual',
  'settings',
];

export function isMainWindowNavigablePage(page: string): page is Page {
  return (MAIN_WINDOW_NAVIGABLE_PAGES as readonly string[]).includes(page);
}
