import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { APP_NAME } from './branding';

const readProjectFile = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('startup and native window names match the sidebar brand', () => {
  const boot = readProjectFile('../index.html');
  assert.ok(boot.includes('<title>' + APP_NAME + '</title>'));
  assert.ok(boot.includes('<span>' + APP_NAME + '</span>'));
  assert.ok(boot.includes('/src/assets/brand/codex-tools.svg'));
  assert.doesNotMatch(boot, /Cockpit Tools/);

  for (const [file, identifier] of [
    ['tauri.conf.json', 'com.jlcodes.cockpit-tools'],
    ['tauri.dev.conf.json', 'com.jlcodes.cockpit-tools.dev'],
  ]) {
    const config = JSON.parse(readProjectFile('../src-tauri/' + file));
    assert.equal(config.productName, APP_NAME);
    assert.equal(config.identifier, identifier);
    assert.ok(config.app.windows.every((window: { title: string }) => window.title === APP_NAME));
  }
});

test('all supported locales use the same brand in app and about labels', () => {
  const files = readdirSync(new URL('./locales/', import.meta.url)).filter((name) => name.endsWith('.json'));
  assert.ok(files.length > 0);
  for (const file of files) {
    const locale = JSON.parse(readProjectFile('./locales/' + file));
    assert.equal(locale.common.appName, APP_NAME, file);
    assert.equal(locale.settings.about.appName, APP_NAME, file);
  }
});
