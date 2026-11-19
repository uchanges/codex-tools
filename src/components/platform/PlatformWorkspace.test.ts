import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer, type ViteDevServer } from 'vite';

let server: ViteDevServer;
let CodexHeader: typeof import('../CodexOverviewTabsHeader').CodexOverviewTabsHeader;
let AntigravityHeader: typeof import('../OverviewTabsHeader').OverviewTabsHeader;
let WorkspaceState: typeof import('./PlatformWorkspaceState').PlatformWorkspaceState;
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');

before(async () => {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: { getItem: () => null, setItem() {}, removeItem() {} },
  });
  server = await createServer({
    server: { middlewareMode: true, watch: null, hmr: false },
    optimizeDeps: { noDiscovery: true, include: [] },
    appType: 'custom',
  });
  ({ CodexOverviewTabsHeader: CodexHeader } = await server.ssrLoadModule('/src/components/CodexOverviewTabsHeader.tsx'));
  ({ OverviewTabsHeader: AntigravityHeader } = await server.ssrLoadModule('/src/components/OverviewTabsHeader.tsx'));
  ({ PlatformWorkspaceState: WorkspaceState } = await server.ssrLoadModule('/src/components/platform/PlatformWorkspaceState.tsx'));
});

after(async () => {
  await server?.close();
  if (originalStorage) Object.defineProperty(globalThis, 'localStorage', originalStorage);
  else Reflect.deleteProperty(globalThis, 'localStorage');
});

test('Codex workspace reflects the selected tab, custom ordering, and More placement', () => {
  const html = renderToStaticMarkup(createElement(CodexHeader, {
    active: 'providers',
    tabs: ['sessions', 'providers', 'overview', 'proxy'],
    tabPlacement: { proxy: 'more' },
    pageRegistry: [
      { id: 'overview', label: 'Accounts', icon: null },
      { id: 'sessions', label: 'Sessions', icon: null },
      { id: 'providers', label: 'Providers', icon: null },
      { id: 'proxy', label: 'Proxy policies', icon: null },
    ],
  }));

  assert.match(html, /<h1>Providers<\/h1>/);
  assert.match(html, /aria-current="page" title="Providers"/);
  assert.ok(html.indexOf('title="Sessions"') < html.indexOf('title="Providers"'));
  assert.ok(html.indexOf('title="Providers"') < html.indexOf('title="Accounts"'));
  assert.match(html, /aria-haspopup="menu" aria-expanded="false"/);
  assert.doesNotMatch(html, /Proxy policies/);
});

test('Codex surfaces a tab selected from More without adding it to the visible rail', () => {
  const html = renderToStaticMarkup(createElement(CodexHeader, {
    active: 'proxy',
    tabs: ['overview', 'proxy'],
    tabPlacement: { proxy: 'more' },
    pageRegistry: [
      { id: 'overview', label: 'Accounts', icon: null },
      { id: 'proxy', label: 'Proxy policies', icon: null },
    ],
  }));
  assert.match(html, /<h1>Proxy policies<\/h1>/);
  assert.match(html, /class="page-more-trigger is-active"/);
  assert.doesNotMatch(html, /title="Proxy policies"/);
});

test('Antigravity shows its active view, description and all five routes', () => {
  const html = renderToStaticMarkup(createElement(AntigravityHeader, {
    active: 'antigravity-usage',
    subtitle: 'Local session metrics',
  }));
  assert.match(html, /<h1>Session Usage<\/h1>/);
  assert.match(html, /<p>Local session metrics<\/p>/);
  assert.equal([...html.matchAll(/class="platform-workspace-tab(?: active)?"/g)].length, 5);
  assert.equal([...html.matchAll(/aria-current="page"/g)].length, 1);
});

test('workspace empty states keep actions, while only loading announces progress', () => {
  const empty = renderToStaticMarkup(createElement(
    WorkspaceState, { kind: 'empty', title: 'No accounts', description: 'Add your first account.' },
    createElement('button', { type: 'button' }, 'Add account'),
  ));
  const loading = renderToStaticMarkup(createElement(WorkspaceState, { kind: 'loading', title: 'Loading' }));
  assert.match(empty, /<h2>No accounts<\/h2>/);
  assert.match(empty, /platform-workspace-state-actions/);
  assert.match(empty, /Add account/);
  assert.doesNotMatch(empty, /role="status"/);
  assert.match(loading, /data-state="loading" role="status"/);
});
