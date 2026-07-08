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

const OPENCODE_HOME = process.env.OPENCODE_HOME || path.join(os.homedir(), '.config', 'opencode');
const OPENCODE_COMMANDS_DIR = path.join(OPENCODE_HOME, 'commands');
const OPENCODE_BUNDLE_DIR = path.join(OPENCODE_HOME, 'ksdd');

// Google Antigravity — quarto target. Duas superfícies globais de skills (CLI/TUI + IDE) + bundle compartilhado.
// Path do IDE (`antigravity/skills`) marcado [verificar] — confirmar no dogfood (task 034). ADR-011 documenta a 4ª cópia.
const ANTIGRAVITY_HOME = process.env.ANTIGRAVITY_HOME || path.join(os.homedir(), '.gemini');
const ANTIGRAVITY_CLI_SKILLS_DIR = path.join(ANTIGRAVITY_HOME, 'antigravity-cli', 'skills');
const ANTIGRAVITY_IDE_SKILLS_DIR = path.join(ANTIGRAVITY_HOME, 'antigravity', 'skills');
const ANTIGRAVITY_BUNDLE_DIR = path.join(ANTIGRAVITY_HOME, 'ksdd');

// GitHub Copilot — quinto target (ADR-012). Prompt files (*.prompt.md) no perfil global do VS Code
// (path por SO via resolveVscodeUserDir), chat mode, modo project-scoped (.github/) e placeholder Copilot CLI (~/.copilot).
// COPILOT_HOME faz override do diretório <...>/Code/User do VS Code (cobre Insiders/portátil).
const COPILOT_CLI_DIR = path.join(os.homedir(), '.copilot');

// Resolve o diretório de perfil do usuário do VS Code por SO (onde vivem os prompt files globais).
function resolveVscodeUserDir() {
  if (process.env.COPILOT_HOME) return process.env.COPILOT_HOME;
  const home = os.homedir();
  switch (process.platform) {
    case 'darwin': return path.join(home, 'Library', 'Application Support', 'Code', 'User');
    case 'win32':  return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Code', 'User');
    default:       return path.join(home, '.config', 'Code', 'User');
  }
}

const COMMAND_FILES = ['start.md', 'spec.md', 'tech.md', 'design.md', 'new:feature.md', 'new:fix.md', 'build:feature.md', 'build:fix.md', 'build:all.md', 'setup.md', 'archive.md'];

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

/** Normaliza manifest legado (array `files`) para `{ targets: { claude, codex, opencode, antigravity, copilot } }`. */
function normalizeManifest(manifest) {
  if (!manifest) return null;
  if (manifest.targets && Array.isArray(manifest.targets.claude)) {
    return {
      ...manifest,
      targets: {
        claude: manifest.targets.claude,
        codex: Array.isArray(manifest.targets.codex) ? manifest.targets.codex : [],
        opencode: Array.isArray(manifest.targets.opencode) ? manifest.targets.opencode : [],
        antigravity: Array.isArray(manifest.targets.antigravity) ? manifest.targets.antigravity : [],
        copilot: Array.isArray(manifest.targets.copilot) ? manifest.targets.copilot : [],
      },
    };
  }
  if (Array.isArray(manifest.files)) {
    return {
      ...manifest,
      targets: { claude: manifest.files, codex: [], opencode: [], antigravity: [], copilot: [] },
    };
  }
  return { ...manifest, targets: { claude: [], codex: [], opencode: [], antigravity: [], copilot: [] } };
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

// Converte 'commands/foo:bar.md' em 'ksdd-foo-bar.md'. Usado por Codex e opencode (ambos não aceitam ':' em filename de command).
function agentPromptBasename(commandFile) {
  const stem = commandFile.replace(/\.md$/i, '').replace(/:/g, '-');
  return `ksdd-${stem}.md`;
}

// Copilot exige sufixo `.prompt.md`. Reusa agentPromptBasename e troca a extensão. Ex: 'new:feature.md' -> 'ksdd-new-feature.prompt.md'.
function copilotPromptBasename(commandFile) {
  return agentPromptBasename(commandFile).replace(/\.md$/i, '.prompt.md');
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
    const name = agentPromptBasename(file);
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

function installOpencode(tracked, out) {
  ensureDir(OPENCODE_COMMANDS_DIR);
  for (const file of COMMAND_FILES) {
    const src = path.join(PKG_ROOT, 'commands', file);
    if (!fs.existsSync(src)) continue;
    const name = agentPromptBasename(file);
    const dst = path.join(OPENCODE_COMMANDS_DIR, name);
    copyFile(src, dst);
    tracked.push(dst);
    out('  ' + green('✓') + ' opencode ' + dim('~/.config/opencode/commands/') + name);
  }

  ensureDir(OPENCODE_BUNDLE_DIR);
  for (const sub of ['references', 'agents']) {
    const src = path.join(PKG_ROOT, sub);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(OPENCODE_BUNDLE_DIR, sub), tracked);
      out('  ' + green('✓') + ' opencode ' + dim('~/.config/opencode/ksdd/') + sub + '/');
    }
  }
  for (const top of ['README.md', 'INSTALL.md']) {
    const src = path.join(PKG_ROOT, top);
    if (fs.existsSync(src)) {
      const dst = path.join(OPENCODE_BUNDLE_DIR, top);
      copyFile(src, dst);
      tracked.push(dst);
    }
  }

  const agentsSrc = path.join(PKG_ROOT, 'references', 'opencode-AGENTS.md');
  const agentsDst = path.join(OPENCODE_BUNDLE_DIR, 'AGENTS.md');
  if (fs.existsSync(agentsSrc)) {
    copyFile(agentsSrc, agentsDst);
    tracked.push(agentsDst);
    out('  ' + green('✓') + ' opencode ' + dim('~/.config/opencode/ksdd/') + 'AGENTS.md');
  } else {
    out('  ' + yellow('aviso:') + ' references/opencode-AGENTS.md ainda não existe — bundle ksdd/AGENTS.md será pulado nesta instalação');
  }
}

// Quarto target: Google Antigravity. Cópia adaptada de installOpencode (ADR-011 — duplicação intencional).
// Instala os 9 commands como skills em DUAS superfícies globais (CLI/TUI + IDE) e bundla references/agents
// uma única vez em ~/.gemini/ksdd/, com AGENTS.md derivado de references/antigravity-AGENTS.md.
function installAntigravity(tracked, out) {
  for (const [skillsDir, label, hint] of [
    [ANTIGRAVITY_CLI_SKILLS_DIR, 'antigr-cli', '~/.gemini/antigravity-cli/skills/'],
    [ANTIGRAVITY_IDE_SKILLS_DIR, 'antigr-ide', '~/.gemini/antigravity/skills/'],
  ]) {
    ensureDir(skillsDir);
    for (const file of COMMAND_FILES) {
      const src = path.join(PKG_ROOT, 'commands', file);
      if (!fs.existsSync(src)) continue;
      const name = agentPromptBasename(file);
      const dst = path.join(skillsDir, name);
      copyFile(src, dst);
      tracked.push(dst);
      out('  ' + green('✓') + ' ' + label + ' ' + dim(hint) + name);
    }
  }

  ensureDir(ANTIGRAVITY_BUNDLE_DIR);
  for (const sub of ['references', 'agents']) {
    const src = path.join(PKG_ROOT, sub);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(ANTIGRAVITY_BUNDLE_DIR, sub), tracked);
      out('  ' + green('✓') + ' antigr    ' + dim('~/.gemini/ksdd/') + sub + '/');
    }
  }
  for (const top of ['README.md', 'INSTALL.md']) {
    const src = path.join(PKG_ROOT, top);
    if (fs.existsSync(src)) {
      const dst = path.join(ANTIGRAVITY_BUNDLE_DIR, top);
      copyFile(src, dst);
      tracked.push(dst);
    }
  }

  const agentsSrc = path.join(PKG_ROOT, 'references', 'antigravity-AGENTS.md');
  const agentsDst = path.join(ANTIGRAVITY_BUNDLE_DIR, 'AGENTS.md');
  if (fs.existsSync(agentsSrc)) {
    copyFile(agentsSrc, agentsDst);
    tracked.push(agentsDst);
    out('  ' + green('✓') + ' antigr    ' + dim('~/.gemini/ksdd/') + 'AGENTS.md');
  } else {
    out('  ' + yellow('aviso:') + ' references/antigravity-AGENTS.md ainda não existe — bundle ksdd/AGENTS.md será pulado nesta instalação');
  }
}

// Quinto target: GitHub Copilot. Cópia adaptada de installAntigravity (ADR-012 — duplicação intencional).
// Modo global (default): prompt files (*.prompt.md) + chat mode no perfil do VS Code, bundle em <vscode-user>/ksdd/
// e placeholder no Copilot CLI (~/.copilot/prompts/). Modo project (opts.project): grava só em .github/ do repo atual.
function installCopilot(tracked, out, opts) {
  opts = opts || {};

  if (opts.project) {
    const base = path.join(process.cwd(), '.github');
    const promptsDir = path.join(base, 'prompts');
    ensureDir(promptsDir);
    for (const file of COMMAND_FILES) {
      const src = path.join(PKG_ROOT, 'commands', file);
      if (!fs.existsSync(src)) continue;
      const name = copilotPromptBasename(file);
      const dst = path.join(promptsDir, name);
      copyFile(src, dst);
      tracked.push(dst);
      out('  ' + green('✓') + ' copilot  ' + dim('.github/prompts/') + name);
    }

    const chatSrc = path.join(PKG_ROOT, 'references', 'copilot-AGENTS.md');
    const chatDst = path.join(base, 'chatmodes', 'ksdd.chatmode.md');
    if (fs.existsSync(chatSrc)) {
      copyFile(chatSrc, chatDst);
      tracked.push(chatDst);
      out('  ' + green('✓') + ' copilot  ' + dim('.github/chatmodes/') + 'ksdd.chatmode.md');
    } else {
      out('  ' + yellow('aviso:') + ' references/copilot-AGENTS.md ainda não existe — .github/chatmodes/ksdd.chatmode.md será pulado nesta instalação');
    }
    return;
  }

  const userDir = resolveVscodeUserDir();
  const promptsDir = path.join(userDir, 'prompts');
  ensureDir(promptsDir);
  for (const file of COMMAND_FILES) {
    const src = path.join(PKG_ROOT, 'commands', file);
    if (!fs.existsSync(src)) continue;
    const name = copilotPromptBasename(file);
    const dst = path.join(promptsDir, name);
    copyFile(src, dst);
    tracked.push(dst);
    out('  ' + green('✓') + ' copilot  ' + dim('<vscode-user>/prompts/') + name);
  }

  const chatSrc = path.join(PKG_ROOT, 'references', 'copilot-AGENTS.md');
  const chatDst = path.join(promptsDir, 'ksdd.chatmode.md');
  if (fs.existsSync(chatSrc)) {
    copyFile(chatSrc, chatDst);
    tracked.push(chatDst);
    out('  ' + green('✓') + ' copilot  ' + dim('<vscode-user>/prompts/') + 'ksdd.chatmode.md');
  } else {
    out('  ' + yellow('aviso:') + ' references/copilot-AGENTS.md ainda não existe — chat mode ksdd.chatmode.md será pulado nesta instalação');
  }

  const bundleDir = path.join(userDir, 'ksdd');
  ensureDir(bundleDir);
  for (const sub of ['references', 'agents']) {
    const src = path.join(PKG_ROOT, sub);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(bundleDir, sub), tracked);
      out('  ' + green('✓') + ' copilot  ' + dim('<vscode-user>/ksdd/') + sub + '/');
    }
  }
  for (const top of ['README.md', 'INSTALL.md']) {
    const src = path.join(PKG_ROOT, top);
    if (fs.existsSync(src)) {
      const dst = path.join(bundleDir, top);
      copyFile(src, dst);
      tracked.push(dst);
    }
  }

  const agentsSrc = path.join(PKG_ROOT, 'references', 'copilot-AGENTS.md');
  const agentsDst = path.join(bundleDir, 'AGENTS.md');
  if (fs.existsSync(agentsSrc)) {
    copyFile(agentsSrc, agentsDst);
    tracked.push(agentsDst);
    out('  ' + green('✓') + ' copilot  ' + dim('<vscode-user>/ksdd/') + 'AGENTS.md');
  } else {
    out('  ' + yellow('aviso:') + ' references/copilot-AGENTS.md ainda não existe — bundle ksdd/AGENTS.md será pulado nesta instalação');
  }

  // Placeholder Copilot CLI: o CLI ainda não consome comandos custom (copilot-cli#618/#1113), mas
  // deixamos os prompt files prontos em ~/.copilot/prompts/ para quando o suporte chegar.
  const cliPromptsDir = path.join(COPILOT_CLI_DIR, 'prompts');
  ensureDir(cliPromptsDir);
  for (const file of COMMAND_FILES) {
    const src = path.join(PKG_ROOT, 'commands', file);
    if (!fs.existsSync(src)) continue;
    const name = copilotPromptBasename(file);
    const dst = path.join(cliPromptsDir, name);
    copyFile(src, dst);
    tracked.push(dst);
  }
  out('  ' + green('✓') + ' copilot  ' + dim('~/.copilot/prompts/') + '(placeholder CLI — Copilot CLI ainda não consome comandos custom: copilot-cli#618/#1113)');
}

function cmdInstall(args) {
  const silent = args.flags.has('quiet') || args.flags.has('silent');
  const postinstall = args.flags.has('postinstall');
  const withCodex = args.flags.has('codex') || (postinstall && process.env.KSDD_WITH_CODEX === '1');
  const withOpencode = args.flags.has('opencode') || (postinstall && process.env.KSDD_WITH_OPENCODE === '1');
  const withAntigravity = args.flags.has('antigravity') || (postinstall && process.env.KSDD_WITH_ANTIGRAVITY === '1');
  const withCopilot = args.flags.has('copilot') || (postinstall && process.env.KSDD_WITH_COPILOT === '1');
  const projectMode = args.flags.has('project');
  const out = silent ? () => {} : log;

  if (postinstall && process.env.KSDD_SKIP_POSTINSTALL === '1') {
    return;
  }

  const targetsLabel = [dim(CLAUDE_HOME)];
  if (withCodex) {
    targetsLabel.push(dim(CODEX_HOME));
    targetsLabel.push(dim(path.join(os.homedir(), '.agents/skills/ksdd')));
  }
  if (withOpencode) targetsLabel.push(dim(OPENCODE_HOME));
  if (withAntigravity) targetsLabel.push(dim(ANTIGRAVITY_HOME));
  if (withCopilot) targetsLabel.push(dim(projectMode ? path.join(process.cwd(), '.github') : resolveVscodeUserDir()));
  out(bold('KSDD') + ' — instalando em ' + targetsLabel.join(' + '));

  const prev = normalizeManifest(loadManifest());
  const prevClaude = (prev && prev.targets && prev.targets.claude) || [];
  const prevCodex = (prev && prev.targets && prev.targets.codex) || [];
  const prevOpencode = (prev && prev.targets && prev.targets.opencode) || [];
  const prevAntigravity = (prev && prev.targets && prev.targets.antigravity) || [];
  const prevCopilot = (prev && prev.targets && prev.targets.copilot) || [];

  for (const f of prevClaude) removePath(f);

  const claudeTracked = [];
  installClaude(claudeTracked, out);

  let codexTracked = prevCodex;
  if (withCodex) {
    for (const f of prevCodex) removePath(f);
    codexTracked = [];
    installCodex(codexTracked, out);
  }

  let opencodeTracked = prevOpencode;
  if (withOpencode) {
    for (const f of prevOpencode) removePath(f);
    opencodeTracked = [];
    installOpencode(opencodeTracked, out);
  }

  let antigravityTracked = prevAntigravity;
  if (withAntigravity) {
    for (const f of prevAntigravity) removePath(f);
    antigravityTracked = [];
    installAntigravity(antigravityTracked, out);
  }

  let copilotTracked = prevCopilot;
  if (withCopilot) {
    for (const f of prevCopilot) removePath(f);
    copilotTracked = [];
    installCopilot(copilotTracked, out, { project: projectMode });
  }

  const manifest = {
    version: require('../package.json').version,
    installedAt: new Date().toISOString(),
    pkgRoot: PKG_ROOT,
    targets: {
      claude: claudeTracked,
      codex: codexTracked,
      opencode: opencodeTracked,
      antigravity: antigravityTracked,
      copilot: copilotTracked,
    },
  };
  saveManifest(manifest);
  out('');

  const targetNames = ['Claude Code'];
  const counts = [claudeTracked.length];
  if (withCodex) { targetNames.push('Codex'); counts.push(codexTracked.length); }
  if (withOpencode) { targetNames.push('opencode'); counts.push(opencodeTracked.length); }
  if (withAntigravity) { targetNames.push('Google Antigravity'); counts.push(antigravityTracked.length); }
  if (withCopilot) { targetNames.push('GitHub Copilot'); counts.push(copilotTracked.length); }

  let headline;
  if (targetNames.length === 1) {
    headline = green('KSDD instalado (Claude Code).');
  } else {
    const list = targetNames.slice(0, -1).join(', ') + ' e ' + targetNames[targetNames.length - 1];
    headline = green('✓ KSDD instalado em ' + list + ' (' + counts.join('+') + ' arquivos).');
  }
  let tail = headline + ' Reinicie o Claude Code e use ' + bold('/ksdd:start');
  if (withCodex) {
    tail += '\n' + green('Integração Codex:') + ' reinicie o Codex CLI/IDE e use ' + bold('/prompts:ksdd-start') + ' (ou ' + bold('$ksdd') + ' skill em ~/.agents/skills/ksdd).';
  }
  if (withOpencode) {
    tail += '\n' + green('Integração opencode:') + ' reinicie o opencode e use ' + bold('/ksdd-start') + ' (bundle em ~/.config/opencode/ksdd/).';
  }
  if (withAntigravity) {
    tail += '\n' + green('Integração Google Antigravity:') + ' reinicie o Antigravity (CLI/TUI ou IDE) e use ' + bold('/ksdd-start') + ' (bundle em ~/.gemini/ksdd/).';
  }
  if (withCopilot) {
    tail += '\n' + green('Integração GitHub Copilot:') + ' abra o VS Code, use os prompt files como ' + bold('/ksdd-start') + ' no Copilot Chat' + (projectMode ? ' (instalado em .github/ do projeto).' : ' (perfil global; bundle em <vscode-user>/ksdd/).');
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
      removePath(path.join(CODEX_PROMPTS_DIR, agentPromptBasename(file)));
    }
    removePath(AGENTS_SKILLS_KSDD);
    pruneEmptyDirs(path.join(os.homedir(), '.agents', 'skills'));
    // Fallback opencode: remove arquivos conhecidos por convenção.
    try {
      const entries = fs.readdirSync(OPENCODE_COMMANDS_DIR);
      for (const name of entries) {
        if (name.startsWith('ksdd-')) {
          removePath(path.join(OPENCODE_COMMANDS_DIR, name));
        }
      }
    } catch { /* diretório inexistente: ignore */ }
    removePath(OPENCODE_BUNDLE_DIR);
    pruneEmptyDirs(OPENCODE_BUNDLE_DIR);
    pruneEmptyDirs(OPENCODE_COMMANDS_DIR);
    // Fallback Antigravity: remove skills `ksdd-*` nas duas superfícies + bundle, por convenção.
    for (const skillsDir of [ANTIGRAVITY_CLI_SKILLS_DIR, ANTIGRAVITY_IDE_SKILLS_DIR]) {
      try {
        for (const name of fs.readdirSync(skillsDir)) {
          if (name.startsWith('ksdd-')) removePath(path.join(skillsDir, name));
        }
      } catch { /* diretório inexistente: ignore */ }
      pruneEmptyDirs(skillsDir);
    }
    removePath(ANTIGRAVITY_BUNDLE_DIR);
    pruneEmptyDirs(ANTIGRAVITY_BUNDLE_DIR);
    // Fallback Copilot: remove prompt files/chat mode `ksdd-*` + bundle por convenção (path por SO).
    const copilotUserDir = resolveVscodeUserDir();
    const copilotPromptsDir = path.join(copilotUserDir, 'prompts');
    try {
      for (const name of fs.readdirSync(copilotPromptsDir)) {
        if (name.startsWith('ksdd-') || name === 'ksdd.chatmode.md') removePath(path.join(copilotPromptsDir, name));
      }
    } catch { /* inexistente: ignore */ }
    removePath(path.join(copilotUserDir, 'ksdd'));
    pruneEmptyDirs(path.join(copilotUserDir, 'ksdd'));
    pruneEmptyDirs(copilotPromptsDir);
    const copilotCliPrompts = path.join(COPILOT_CLI_DIR, 'prompts');
    try {
      for (const name of fs.readdirSync(copilotCliPrompts)) {
        if (name.startsWith('ksdd-')) removePath(path.join(copilotCliPrompts, name));
      }
    } catch { /* inexistente: ignore */ }
    pruneEmptyDirs(copilotCliPrompts);
    return;
  }

  const all = [
    ...(prev.targets && prev.targets.claude ? prev.targets.claude : []),
    ...(prev.targets && prev.targets.codex ? prev.targets.codex : []),
    ...(prev.targets && prev.targets.opencode ? prev.targets.opencode : []),
    ...(prev.targets && prev.targets.antigravity ? prev.targets.antigravity : []),
    ...(prev.targets && prev.targets.copilot ? prev.targets.copilot : []),
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
  pruneEmptyDirs(OPENCODE_BUNDLE_DIR);
  pruneEmptyDirs(OPENCODE_COMMANDS_DIR);
  // Prune restrito aos subdirs KSDD do Antigravity — nunca subir para ~/.gemini/ (compartilhado com gemini-cli).
  pruneEmptyDirs(ANTIGRAVITY_BUNDLE_DIR);
  pruneEmptyDirs(ANTIGRAVITY_CLI_SKILLS_DIR);
  pruneEmptyDirs(ANTIGRAVITY_IDE_SKILLS_DIR);
  // Prune Copilot restrito aos subdirs KSDD — nunca subir para <vscode-user>/ (config do VS Code) nem ~/.copilot/ raiz.
  const copilotUserDir = resolveVscodeUserDir();
  pruneEmptyDirs(path.join(copilotUserDir, 'ksdd'));
  pruneEmptyDirs(path.join(copilotUserDir, 'prompts'));
  pruneEmptyDirs(path.join(COPILOT_CLI_DIR, 'prompts'));

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
  const oc = (prev.targets && prev.targets.opencode) || [];
  const ag = (prev.targets && prev.targets.antigravity) || [];
  const cp = (prev.targets && prev.targets.copilot) || [];
  log('  Claude       : ' + cl.length + ' arquivos — ' + dim(COMMANDS_DIR));
  log('  Codex        : ' + cx.length + ' arquivos — prompts ' + dim(CODEX_PROMPTS_DIR) + ' · skill ' + dim(AGENTS_SKILLS_KSDD));
  if (oc.length > 0) {
    log('  opencode     : ' + oc.length + ' arquivos — commands ' + dim(OPENCODE_COMMANDS_DIR) + ' · bundle ' + dim(OPENCODE_BUNDLE_DIR));
  }
  if (ag.length > 0) {
    log('  antigravity  : ' + ag.length + ' arquivos — skills ' + dim(ANTIGRAVITY_CLI_SKILLS_DIR) + ' + ' + dim(ANTIGRAVITY_IDE_SKILLS_DIR) + ' · bundle ' + dim(ANTIGRAVITY_BUNDLE_DIR));
  }
  if (cp.length > 0) {
    log('  copilot      : ' + cp.length + ' arquivos — prompts ' + dim(path.join(resolveVscodeUserDir(), 'prompts')) + ' · bundle ' + dim(path.join(resolveVscodeUserDir(), 'ksdd')));
  }
}

function cmdHelp() {
  log(bold('ksdd') + ' — instalador KSDD para Claude Code, Codex, opencode, Google Antigravity e GitHub Copilot\n');
  log('Uso:');
  log('  ksdd install               Copia commands e skills para ~/.claude/');
  log('  ksdd install --codex       Também instala prompts em ~/.codex/prompts/ e skill em ~/.agents/skills/ksdd/');
  log('  ksdd install --opencode    Também instala commands + bundle em ~/.config/opencode/');
  log('  ksdd install --antigravity Também instala skills + bundle em ~/.gemini/ (CLI/TUI + IDE)');
  log('  ksdd install --copilot     Também instala prompt files no perfil do VS Code (+ chat mode, bundle, placeholder CLI)');
  log('  ksdd install --copilot --project   Instala prompt files em .github/prompts/ do repo atual');
  log('  ksdd uninstall             Remove arquivos previamente instalados');
  log('  ksdd status                Mostra estado da instalação');
  log('  ksdd help                  Esta mensagem');
  log('');
  log('  As flags são combináveis: ksdd install --codex --opencode --antigravity --copilot');
  log('');
  log('Variáveis de ambiente:');
  log('  KSDD_SKIP_POSTINSTALL=1   Pula o postinstall do npm');
  log('  KSDD_WITH_CODEX=1         Equivale a --codex no postinstall (npm install)');
  log('  KSDD_WITH_OPENCODE=1      Equivale a --opencode no postinstall');
  log('  KSDD_WITH_ANTIGRAVITY=1   Equivale a --antigravity no postinstall');
  log('  KSDD_WITH_COPILOT=1       Equivale a --copilot no postinstall');
  log('  CODEX_HOME                Pasta do Codex (default: ~/.codex)');
  log('  OPENCODE_HOME             Pasta do opencode (default: ~/.config/opencode)');
  log('  ANTIGRAVITY_HOME          Pasta do Antigravity (default: ~/.gemini)');
  log('  COPILOT_HOME              Pasta User do VS Code (default por SO: ~/.config/Code/User etc.)');
  log('');
  log('Flags:');
  log('  --quiet           Silencia a saída');
  log('');
  log('Após install (invocação por agente):');
  log('  Claude   ' + dim('/ksdd:start') + '   Codex ' + dim('/prompts:ksdd-start') + '   opencode/Antigravity ' + dim('/ksdd-start') + '   Copilot ' + dim('/ksdd-start') + ' (Copilot Chat)');
  log('  ' + dim('Nota: o Copilot CLI ainda não consome comandos custom (copilot-cli#618/#1113); os prompt files funcionam no VS Code Copilot Chat.'));
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
