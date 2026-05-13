#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const PKG_ROOT = path.resolve(__dirname, '..');
const CLAUDE_HOME = path.join(os.homedir(), '.claude');
const COMMANDS_DIR = path.join(CLAUDE_HOME, 'commands');
const SKILLS_DIR = path.join(CLAUDE_HOME, 'skills', 'ksdd');
const MANIFEST = path.join(SKILLS_DIR, '.ksdd-manifest.json');

const COMMAND_FILES = ['start.md', 'spec.md', 'tech.md', 'design.md'];

const COLORS = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (COLORS ? `\x1b[${code}m${s}\x1b[0m` : s);
const green = (s) => c('32', s);
const yellow = (s) => c('33', s);
const red = (s) => c('31', s);
const dim = (s) => c('2', s);
const bold = (s) => c('1', s);

function log(msg) { process.stdout.write(msg + '\n'); }
function err(msg) { process.stderr.write(msg + '\n'); }

function parseArgs(argv) {
  const args = { _: [], flags: new Set() };
  for (const a of argv.slice(2)) {
    if (a.startsWith('--')) args.flags.add(a.slice(2));
    else args._.push(a);
  }
  return args;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  fs.copyFileSync(src, dst);
}

function copyDir(srcDir, dstDir, tracked) {
  ensureDir(dstDir);
  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const src = path.join(srcDir, entry.name);
    const dst = path.join(dstDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(src, dst, tracked);
    } else if (entry.isFile()) {
      copyFile(src, dst);
      tracked.push(dst);
    }
  }
}

function loadManifest() {
  if (!fs.existsSync(MANIFEST)) return null;
  try {
    return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  } catch {
    return null;
  }
}

function saveManifest(manifest) {
  ensureDir(path.dirname(MANIFEST));
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
}

function removePath(p) {
  if (!fs.existsSync(p)) return false;
  fs.rmSync(p, { recursive: true, force: true });
  return true;
}

function pruneEmptyDirs(root) {
  if (!fs.existsSync(root)) return;
  const entries = fs.readdirSync(root, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) pruneEmptyDirs(path.join(root, e.name));
  }
  try {
    if (fs.readdirSync(root).length === 0) fs.rmdirSync(root);
  } catch { /* ignore */ }
}

function cmdInstall(args) {
  const silent = args.flags.has('quiet') || args.flags.has('silent');
  const postinstall = args.flags.has('postinstall');
  const out = silent ? () => {} : log;

  // Skip postinstall when running from a local checkout (e.g. dev), unless explicitly forced
  if (postinstall && process.env.KSDD_SKIP_POSTINSTALL === '1') {
    return;
  }

  out(bold('KSDD') + ' — instalando em ' + dim(CLAUDE_HOME));

  // If existing install, remove tracked files first for a clean update
  const prev = loadManifest();
  if (prev && Array.isArray(prev.files)) {
    for (const f of prev.files) removePath(f);
  }

  const tracked = [];

  // 1) commands → ~/.claude/commands/ksdd:<name>.md
  ensureDir(COMMANDS_DIR);
  for (const file of COMMAND_FILES) {
    const src = path.join(PKG_ROOT, 'commands', file);
    if (!fs.existsSync(src)) continue;
    const dst = path.join(COMMANDS_DIR, `ksdd:${file}`);
    copyFile(src, dst);
    tracked.push(dst);
    out('  ' + green('✓') + ' command  ' + dim('~/.claude/commands/') + `ksdd:${file}`);
  }

  // 2) skills payload → ~/.claude/skills/ksdd/
  ensureDir(SKILLS_DIR);
  for (const sub of ['references', 'agents']) {
    const src = path.join(PKG_ROOT, sub);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(SKILLS_DIR, sub), tracked);
      out('  ' + green('✓') + ' skill    ' + dim('~/.claude/skills/ksdd/') + sub + '/');
    }
  }
  for (const top of ['README.md', 'INSTALL.md']) {
    const src = path.join(PKG_ROOT, top);
    if (fs.existsSync(src)) {
      const dst = path.join(SKILLS_DIR, top);
      copyFile(src, dst);
      tracked.push(dst);
    }
  }

  const manifest = {
    version: require('../package.json').version,
    installedAt: new Date().toISOString(),
    pkgRoot: PKG_ROOT,
    files: tracked,
  };
  saveManifest(manifest);
  tracked.push(MANIFEST);

  out('');
  out(green('KSDD instalado.') + ' Reinicie o Claude Code e use ' + bold('/ksdd:start'));
}

function cmdUninstall(args) {
  const silent = args.flags.has('quiet') || args.flags.has('silent');
  const out = silent ? () => {} : log;

  const manifest = loadManifest();
  if (!manifest) {
    out(yellow('Nada para desinstalar — manifesto não encontrado em ' + MANIFEST));
    // Best-effort: remove the ksdd: commands and the skills/ksdd dir
    for (const file of COMMAND_FILES) {
      removePath(path.join(COMMANDS_DIR, `ksdd:${file}`));
    }
    removePath(SKILLS_DIR);
    return;
  }

  let removed = 0;
  for (const f of manifest.files) {
    if (removePath(f)) removed++;
  }
  removePath(MANIFEST);
  removePath(SKILLS_DIR);
  pruneEmptyDirs(path.join(CLAUDE_HOME, 'skills'));

  out(green('KSDD desinstalado.') + ' ' + dim(`(${removed} arquivos removidos)`));
}

function cmdStatus() {
  const manifest = loadManifest();
  if (!manifest) {
    log(yellow('KSDD não está instalado.'));
    log('Rode: ' + bold('ksdd install'));
    process.exitCode = 1;
    return;
  }
  log(bold('KSDD') + ' v' + manifest.version);
  log('  instalado em : ' + manifest.installedAt);
  log('  pacote       : ' + dim(manifest.pkgRoot));
  log('  arquivos     : ' + manifest.files.length);
  log('  commands dir : ' + dim(COMMANDS_DIR));
  log('  skill dir    : ' + dim(SKILLS_DIR));
}

function cmdHelp() {
  log(bold('ksdd') + ' — instalador KSDD para Claude Code\n');
  log('Uso:');
  log('  ksdd install      Copia commands e skills para ~/.claude/');
  log('  ksdd uninstall    Remove arquivos previamente instalados');
  log('  ksdd status       Mostra estado da instalação');
  log('  ksdd help         Esta mensagem');
  log('');
  log('Flags:');
  log('  --quiet           Silencia a saída');
  log('');
  log('Instalação global:');
  log('  ' + dim('npm install -g @kognar/ksdd'));
}

function main() {
  const args = parseArgs(process.argv);
  const cmd = args._[0] || 'help';
  try {
    switch (cmd) {
      case 'install': return cmdInstall(args);
      case 'uninstall':
      case 'remove': return cmdUninstall(args);
      case 'status': return cmdStatus();
      case 'help':
      case '--help':
      case '-h': return cmdHelp();
      default:
        err(red('Comando desconhecido: ') + cmd);
        cmdHelp();
        process.exitCode = 1;
    }
  } catch (e) {
    // postinstall should never fail the npm install
    if (args.flags.has('postinstall')) {
      err(yellow('KSDD postinstall warning: ') + (e && e.message ? e.message : String(e)));
      err(dim('Rode `ksdd install` manualmente para concluir.'));
      return;
    }
    err(red('Erro: ') + (e && e.stack ? e.stack : String(e)));
    process.exitCode = 1;
  }
}

main();
