const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { buildTargetManifests } = require('./build_target_latest_json.cjs');
const { execFileSync, spawnSync } = require('node:child_process');
const { stageReleaseAssets } = require('./stage_release_assets.cjs');

test('builds manifests from the same normalized assets uploaded to GitHub', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-target-manifest-'));
  const rawAssetsDir = path.join(root, 'bundle');
  const assetsDir = path.join(root, 'staged');
  const nsisDir = path.join(rawAssetsDir, 'nsis');
  const notesFile = path.join(root, 'notes.md');
  const outputDir = path.join(root, 'output');
  const rawAssetName = 'Cockpit Tools_1.2.3_x64-setup.exe';
  const stagedAssetName = 'Cockpit.Tools_1.2.3_x64-setup.exe';

  fs.mkdirSync(nsisDir, { recursive: true });
  fs.writeFileSync(path.join(nsisDir, rawAssetName), 'installer');
  fs.writeFileSync(path.join(nsisDir, `${rawAssetName}.sig`), 'test-signature\n');
  fs.writeFileSync(notesFile, 'Release notes\n');
  stageReleaseAssets({
    platform: 'windows',
    assetsDir: rawAssetsDir,
    outputDir: assetsDir,
  });

  const outputs = buildTargetManifests({
    version: '1.2.3',
    repo: 'jlcodes99/cockpit-tools',
    assetsDir,
    notesFile,
    publishedAt: '2026-07-10T12:00:00Z',
    outputDir,
    targets: ['windows-x86_64-nsis'],
  });

  assert.deepEqual(outputs, [path.join(outputDir, 'latest-windows-x86_64-nsis.json')]);
  const manifest = JSON.parse(fs.readFileSync(outputs[0], 'utf8'));
  assert.deepEqual(manifest, {
    version: '1.2.3',
    notes: 'Release notes',
    pub_date: '2026-07-10T12:00:00.000Z',
    url: `https://github.com/jlcodes99/cockpit-tools/releases/download/v1.2.3/${stagedAssetName}`,
    signature: 'test-signature',
  });
});

test('builds a macOS target manifest from the raw Tauri updater archive', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-target-manifest-'));
  const rawAssetsDir = path.join(root, 'bundle');
  const assetsDir = path.join(root, 'staged');
  const notesFile = path.join(root, 'notes.md');
  const outputDir = path.join(root, 'output');

  fs.mkdirSync(path.join(rawAssetsDir, 'macos'), { recursive: true });
  fs.writeFileSync(path.join(rawAssetsDir, 'macos', 'Cockpit Tools.app.tar.gz'), 'archive');
  fs.writeFileSync(
    path.join(rawAssetsDir, 'macos', 'Cockpit Tools.app.tar.gz.sig'),
    'mac-signature',
  );
  fs.writeFileSync(notesFile, 'Release notes');

  stageReleaseAssets({
    platform: 'macos',
    assetsDir: rawAssetsDir,
    outputDir: assetsDir,
    macArch: 'aarch64',
  });
  const [manifestPath] = buildTargetManifests({
    version: '1.2.3',
    repo: 'jlcodes99/cockpit-tools',
    assetsDir,
    notesFile,
    publishedAt: '2026-07-10T12:00:00Z',
    outputDir,
    targets: ['darwin-aarch64-app'],
  });

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  assert.equal(
    manifest.url,
    'https://github.com/jlcodes99/cockpit-tools/releases/download/v1.2.3/Cockpit.Tools_aarch64.app.tar.gz',
  );
  assert.equal(manifest.signature, 'mac-signature');
});

test('rejects updater assets that bypass stable staging', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-target-manifest-'));
  const assetsDir = path.join(root, 'bundle');
  const notesFile = path.join(root, 'notes.md');
  const assetName = 'Cockpit Tools_1.2.3_x64-setup.exe';

  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, assetName), 'installer');
  fs.writeFileSync(path.join(assetsDir, `${assetName}.sig`), 'test-signature');
  fs.writeFileSync(notesFile, 'Release notes');

  assert.throws(
    () =>
      buildTargetManifests({
        version: '1.2.3',
        repo: 'jlcodes99/cockpit-tools',
        assetsDir,
        notesFile,
        publishedAt: '2026-07-10T12:00:00Z',
        outputDir: path.join(root, 'output'),
        targets: ['windows-x86_64-nsis'],
      }),
    /was not staged with a stable name/,
  );
});

test('rejects assets without updater signatures', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-target-manifest-'));
  const assetsDir = path.join(root, 'bundle');
  const notesFile = path.join(root, 'notes.md');

  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(path.join(assetsDir, 'Cockpit.Tools_1.2.3_amd64.deb'), 'package');
  fs.writeFileSync(notesFile, 'Release notes');

  assert.throws(
    () =>
      buildTargetManifests({
        version: '1.2.3',
        repo: 'jlcodes99/cockpit-tools',
        assetsDir,
        notesFile,
        publishedAt: '2026-07-10T12:00:00Z',
        outputDir: path.join(root, 'output'),
        targets: ['linux-x86_64-deb'],
      }),
    /Missing signature file/,
  );
});

test('supports every staged release target', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'cockpit-target-manifest-'));
  const assetsDir = path.join(root, 'bundle');
  const notesFile = path.join(root, 'notes.md');
  const outputDir = path.join(root, 'output');
  const assetsByTarget = {
    'darwin-aarch64-app': 'Cockpit.Tools_1.2.3_aarch64.app.tar.gz',
    'darwin-x86_64-app': 'Cockpit.Tools_1.2.3_x64.app.tar.gz',
    'windows-x86_64-msi': 'Cockpit.Tools_1.2.3_x64_en-US.msi',
    'windows-x86_64-nsis': 'Cockpit.Tools_1.2.3_x64-setup.exe',
    'windows-aarch64-nsis': 'Cockpit.Tools_1.2.3_arm64-setup.exe',
    'linux-x86_64-appimage': 'Cockpit.Tools_1.2.3_amd64.AppImage',
    'linux-x86_64-deb': 'Cockpit.Tools_1.2.3_amd64.deb',
    'linux-x86_64-rpm': 'Cockpit.Tools-1.2.3-1.x86_64.rpm',
    'linux-aarch64-appimage': 'Cockpit.Tools_1.2.3_aarch64.AppImage',
    'linux-aarch64-deb': 'Cockpit.Tools_1.2.3_arm64.deb',
    'linux-aarch64-rpm': 'Cockpit.Tools-1.2.3-1.aarch64.rpm',
  };

  fs.mkdirSync(assetsDir, { recursive: true });
  fs.writeFileSync(notesFile, 'Release notes');
  for (const assetName of Object.values(assetsByTarget)) {
    fs.writeFileSync(path.join(assetsDir, assetName), 'package');
    fs.writeFileSync(path.join(assetsDir, `${assetName}.sig`), `${assetName}-signature`);
  }

  const targets = Object.keys(assetsByTarget);
  const outputs = buildTargetManifests({
    version: '1.2.3',
    repo: 'jlcodes99/cockpit-tools',
    assetsDir,
    notesFile,
    publishedAt: '2026-07-10T12:00:00Z',
    outputDir,
    targets,
  });

  assert.equal(outputs.length, targets.length);
  for (const target of targets) {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(outputDir, `latest-${target}.json`), 'utf8'),
    );
    assert.match(manifest.url, new RegExp(assetsByTarget[target].replaceAll('.', '\\.')));
  }

  const mergedFile = path.join(outputDir, 'latest.json');
  execFileSync(process.execPath, [
    path.join(__dirname, 'build_merged_latest_json.cjs'),
    '--version', '1.2.3',
    '--repo', 'jlcodes99/cockpit-tools',
    '--assets-dir', assetsDir,
    '--notes-file', notesFile,
    '--published-at', '2026-07-10T12:00:00Z',
    '--output', mergedFile,
  ]);
  const { platforms } = JSON.parse(fs.readFileSync(mergedFile, 'utf8'));
  const armAsset = assetsByTarget['windows-aarch64-nsis'];
  assert.match(platforms['windows-aarch64-nsis'].url, /_arm64-setup\.exe$/);
  assert.equal(platforms['windows-aarch64-nsis'].signature, `${armAsset}-signature`);
  assert.deepEqual(platforms['windows-aarch64'], platforms['windows-aarch64-nsis']);
  assert.match(platforms['windows-x86_64'].url, /_x64_en-US\.msi$/);
  assert.match(platforms['windows-x86_64-nsis'].url, /_x64-setup\.exe$/);
});

test('generates a fork manifest for Windows and Linux without macOS signing', (context) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'codex-tools-fork-manifest-'));
  context.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const notes = path.join(root, 'notes.md');
  const output = path.join(root, 'latest.json');
  fs.writeFileSync(notes, 'Release notes');
  const assets = [
    'codex.tools_1.2.3_x64_en-US.msi',
    'codex.tools_1.2.3_x64-setup.exe',
    'codex.tools_1.2.3_arm64-setup.exe',
    'codex.tools_1.2.3_amd64.AppImage',
    'codex.tools_1.2.3_aarch64.AppImage',
    'codex.tools_1.2.3_amd64.deb',
    'codex.tools_1.2.3_arm64.deb',
    'codex.tools-1.2.3-1.x86_64.rpm',
    'codex.tools-1.2.3-1.aarch64.rpm',
  ];
  for (const asset of assets) {
    fs.writeFileSync(path.join(root, asset), 'installer');
    fs.writeFileSync(path.join(root, asset + '.sig'), 'signed-' + asset);
  }
  const command = [
    path.join(__dirname, 'build_merged_latest_json.cjs'),
    '--version', '1.2.3', '--repo', 'uchanges/codex-tools', '--assets-dir', root,
    '--notes-file', notes, '--published-at', '2026-11-19T12:00:00Z', '--output', output,
  ];
  const build = (...args) => spawnSync(
    process.execPath, [...command, ...args], { encoding: 'utf8' },
  );
  assert.match(build().stderr, /Missing required updater asset for darwin/);
  const good = build('--without-macos');
  assert.equal(good.status, 0, good.stderr);
  const { platforms } = JSON.parse(fs.readFileSync(output, 'utf8'));
  assert.ok(Object.keys(platforms).every((target) => /^(windows|linux)-/.test(target)));
  assert.equal(platforms['windows-x86_64-msi'].signature, 'signed-' + assets[0]);
  assert.equal(platforms['linux-aarch64-rpm'].url,
    'https://github.com/uchanges/codex-tools/releases/download/v1.2.3/' + assets.at(-1));

  fs.unlinkSync(path.join(root, assets[0] + '.sig'));
  assert.match(build('--without-macos').stderr, /Missing signature file/);
});
