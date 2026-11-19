import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { resolveUpdaterDownloadUrl } from './updaterReleaseNotes';

const releases = 'https://github.com/uchanges/codex-tools/releases';

test('the desktop updater only queries this repository', () => {
  const { plugins } = JSON.parse(
    readFileSync(new URL('../../src-tauri/tauri.conf.json', import.meta.url), 'utf8'),
  );
  assert.deepEqual(plugins.updater.endpoints, [
    releases + '/latest/download/latest-{{target}}.json',
    releases + '/latest/download/latest.json',
  ]);
  assert.match(Buffer.from(plugins.updater.pubkey, 'base64').toString('utf8'), /minisign public key:/);
});

test('update links accept fork releases and fall back to the fork for foreign URLs', () => {
  const ownAsset = releases + '/download/v1.4.3/install.exe';
  assert.equal(resolveUpdaterDownloadUrl('1.4.3', { url: ownAsset }), ownAsset);
  assert.equal(resolveUpdaterDownloadUrl('v1.4.3', {
    html_url: 'https://github.com/jlcodes99/cockpit-tools/releases/tag/v1.4.3',
    download_url: releases + '-mirror/download/v1.4.3/install.exe',
  }), releases + '/tag/v1.4.3');
  assert.equal(resolveUpdaterDownloadUrl(''), releases + '/latest');
});
