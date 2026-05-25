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

const CODEX_HOME = process.env.CODEX_HOME || path.join(os.homedir(), '.codex');
const CODEX_PROMPTS_DIR = path.join(CODEX_HOME, 'prompts');
const AGENTS_SKILLS_KSDD = path.join(os.homedir(), '.agents', 'skills', 'ksdd');

const COMMAND_FILES = ['start.md', 'spec.md', 'tech.md', 'design.md', 'new:feature.md', 'build:feature.md', 'build:all.md', 'setup.md', 'archive.md'];

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

/** Normaliza manifest legado (array `files`) para `{ targets: { claude, codex } }`. */
function normalizeManifest(manifest) {
  if (!manifest) return null;
  if (manifest.targets && Array.isArray(manifest.targets.claude)) {
    return {
      ...manifest,
      targets: {
        claude: manifest.targets.claude,
        codex: Array.isArray(manifest.targets.codex) ? manifest.targets.codex : [],
      },
    };
  }
  if (Array.isArray(manifest.files)) {
    return {
      ...manifest,
      targets: { claude: manifest.files, codex: [] },
    };
  }
  return { ...manifest, targets: { claude: [], codex: [] } };
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

/** Nome do ficheiro em ~/.codex/prompts/ (apenas top-level; `:` → `-`). */
function codexPromptBasename(commandFile) {
  const stem = commandFile.replace(/\.md$/i, '').replace(/:/g, '-');
  return `ksdd-${stem}.md`;
}

function installClaude(tracked, out) {
  ensureDir(COMMANDS_DIR);
  for (const file of COMMAND_FILES) {
    const src = path.join(PKG_ROOT, 'commands', file);
    if (!fs.existsSync(src)) continue;
    const dst = path.join(COMMANDS_DIR, `ksdd:${file}`);
    copyFile(src, dst);
    tracked.push(dst);
    out('  ' + green('✓') + ' claude   ' + dim('~/.claude/commands/') + `ksdd:${file}`);
  }

  ensureDir(SKILLS_DIR);
  for (const sub of ['references', 'agents']) {
    const src = path.join(PKG_ROOT, sub);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(SKILLS_DIR, sub), tracked);
      out('  ' + green('✓') + ' claude   ' + dim('~/.claude/skills/ksdd/') + sub + '/');
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
}

function installCodex(tracked, out) {
  ensureDir(CODEX_PROMPTS_DIR);
  for (const file of COMMAND_FILES) {
    const src = path.join(PKG_ROOT, 'commands', file);
    if (!fs.existsSync(src)) continue;
    const name = codexPromptBasename(file);
    const dst = path.join(CODEX_PROMPTS_DIR, name);
    copyFile(src, dst);
    tracked.push(dst);
    out('  ' + green('✓') + ' codex    ' + dim('~/.codex/prompts/') + name);
  }

  ensureDir(AGENTS_SKILLS_KSDD);
  const skillSrc = path.join(PKG_ROOT, 'references', 'codex-SKILL.md');
  const skillDst = path.join(AGENTS_SKILLS_KSDD, 'SKILL.md');
  if (fs.existsSync(skillSrc)) {
    copyFile(skillSrc, skillDst);
    tracked.push(skillDst);
    out('  ' + green('✓') + ' codex    ' + dim('~/.agents/skills/ksdd/') + 'SKILL.md');
  }
  for (const sub of ['references', 'agents']) {
    const src = path.join(PKG_ROOT, sub);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(AGENTS_SKILLS_KSDD, sub), tracked);
      out('  ' + green('✓') + ' codex    ' + dim('~/.agents/skills/ksdd/') + sub + '/');
    }
  }
  for (const top of ['README.md', 'INSTALL.md']) {
    const src = path.join(PKG_ROOT, top);
    if (fs.existsSync(src)) {
      const dst = path.join(AGENTS_SKILLS_KSDD, top);
      copyFile(src, dst);
      tracked.push(dst);
    }
  }
}

function cmdInstall(args) {
  const silent = args.flags.has('quiet') || args.flags.has('silent');
  const postinstall = args.flags.has('postinstall');
  const withCodex = args.flags.has('codex') || process.env.KSDD_WITH_CODEX === '1';
  const out = silent ? () => {} : log;

  if (postinstall && process.env.KSDD_SKIP_POSTINSTALL === '1') {
    return;
  }

  out(bold('KSDD') + ' — instalando em ' + dim(CLAUDE_HOME) + (withCodex ? ' + ' + dim(CODEX_HOME) + ' + ' + dim(path.join(os.homedir(), '.agents/skills/ksdd')) : ''));

  const prev = normalizeManifest(loadManifest());
  const prevClaude = (prev && prev.targets && prev.targets.claude) || [];
  const prevCodex = (prev && prev.targets && prev.targets.codex) || [];

  for (const f of prevClaude) removePath(f);

  const claudeTracked = [];
  installClaude(claudeTracked, out);

  let codexTracked = prevCodex;
  if (withCodex) {
    for (const f of prevCodex) removePath(f);
    codexTracked = [];
    installCodex(codexTracked, out);
  }

  const manifest = {
    version: require('../package.json').version,
    installedAt: new Date().toISOString(),
    pkgRoot: PKG_ROOT,
    targets: {
      claude: claudeTracked,
      codex: codexTracked,
    },
  };
  saveManifest(manifest);
  out('');
  let tail = green('KSDD instalado (Claude Code).') + ' Reinicie o Claude Code e use ' + bold('/ksdd:start');
  if (withCodex) {
    tail += '\n' + green('Integração Codex:') + ' reinicie o Codex CLI/IDE e use ' + bold('/prompts:ksdd-start') + ' (ou ' + bold('$ksdd') + ' skill em ~/.agents/skills/ksdd).';
  }
  out(tail);
}

function cmdUninstall(args) {
  const silent = args.flags.has('quiet') || args.flags.has('silent');
  const out = silent ? () => {} : log;

  const prev = normalizeManifest(loadManifest());
  if (!prev) {
    out(yellow('Nada para desinstalar — manifesto não encontrado em ' + MANIFEST));
    for (const file of COMMAND_FILES) {
      removePath(path.join(COMMANDS_DIR, `ksdd:${file}`));
    }
    removePath(SKILLS_DIR);
    for (const file of COMMAND_FILES) {
      removePath(path.join(CODEX_PROMPTS_DIR, codexPromptBasename(file)));
    }
    removePath(AGENTS_SKILLS_KSDD);
    pruneEmptyDirs(path.join(os.homedir(), '.agents', 'skills'));
    return;
  }

  const all = [
    ...(prev.targets && prev.targets.claude ? prev.targets.claude : []),
    ...(prev.targets && prev.targets.codex ? prev.targets.codex : []),
  ];
  let removed = 0;
  for (const f of all) {
    if (removePath(f)) removed++;
  }
  removePath(MANIFEST);
  removePath(SKILLS_DIR);
  pruneEmptyDirs(path.join(CLAUDE_HOME, 'skills'));
  pruneEmptyDirs(AGENTS_SKILLS_KSDD);
  pruneEmptyDirs(path.join(os.homedir(), '.agents', 'skills'));

  out(green('KSDD desinstalado.') + ' ' + dim(`(${removed} arquivos removidos)`));
}

function cmdStatus() {
  const prev = normalizeManifest(loadManifest());
  if (!prev) {
    log(yellow('KSDD não está instalado.'));
    log('Rode: ' + bold('ksdd install') + ' ou ' + bold('ksdd install --codex'));
    process.exitCode = 1;
    return;
  }
  log(bold('KSDD') + ' v' + prev.version);
  log('  instalado em : ' + prev.installedAt);
  log('  pacote       : ' + dim(prev.pkgRoot));
  const cl = (prev.targets && prev.targets.claude) || [];
  const cx = (prev.targets && prev.targets.codex) || [];
  log('  Claude       : ' + cl.length + ' arquivos — ' + dim(COMMANDS_DIR));
  log('  Codex        : ' + cx.length + ' arquivos — prompts ' + dim(CODEX_PROMPTS_DIR) + ' · skill ' + dim(AGENTS_SKILLS_KSDD));
}

function cmdHelp() {
  log(bold('ksdd') + ' — instalador KSDD para Claude Code e Codex\n');
  log('Uso:');
  log('  ksdd install           Copia commands e skills para ~/.claude/');
  log('  ksdd install --codex   Também instala prompts em ~/.codex/prompts/ e skill em ~/.agents/skills/ksdd/');
  log('  ksdd uninstall         Remove arquivos previamente instalados');
  log('  ksdd status            Mostra estado da instalação');
  log('  ksdd help              Esta mensagem');
  log('');
  log('Variáveis de ambiente:');
  log('  KSDD_SKIP_POSTINSTALL=1   Pula o postinstall do npm');
  log('  KSDD_WITH_CODEX=1         Equivale a --codex no postinstall (npm install)');
  log('  CODEX_HOME                Pasta do Codex (default: ~/.codex)');
  log('');
  log('Flags:');
  log('  --quiet           Silencia a saída');
  log('');
  log('Codex (após install --codex):');
  log('  ' + dim('/prompts:ksdd-start') + ', ' + dim('/prompts:ksdd-spec') + ', ' + dim('/prompts:ksdd-setup') + ', … (ver README)');
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
