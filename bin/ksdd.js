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

// Google Antigravity / Gemini CLI — quarto target. Ambos leem slash commands do MESMO diretório:
// ~/.gemini/commands/<ns>/*.toml (formato TOML nativo do Gemini: `description` + `prompt`). O conteúdo pesado
// fica num bundle (~/.gemini/ksdd/) e é puxado pelo prompt via include `@$HOME/.gemini/ksdd/...`.
// Convenção comprovada pelo GSD (~/.gemini/commands/gsd/*.toml → /gsd:*). ADR-011 documenta a 4ª cópia.
// ANTIGRAVITY_HOME aponta o home do Gemini (default ~/.gemini), compartilhado com gemini-cli.
const ANTIGRAVITY_HOME = process.env.ANTIGRAVITY_HOME || path.join(os.homedir(), '.gemini');
const ANTIGRAVITY_COMMANDS_DIR = path.join(ANTIGRAVITY_HOME, 'commands', 'ksdd'); // namespace ksdd → /ksdd:...
const ANTIGRAVITY_BUNDLE_DIR = path.join(ANTIGRAVITY_HOME, 'ksdd');               // corpos dos commands + references + agents

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

/** Normaliza manifest legado (array `files`) para `{ targets: { claude, codex, opencode, antigravity } }`. */
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
      },
    };
  }
  if (Array.isArray(manifest.files)) {
    return {
      ...manifest,
      targets: { claude: manifest.files, codex: [], opencode: [], antigravity: [] },
    };
  }
  return { ...manifest, targets: { claude: [], codex: [], opencode: [], antigravity: [] } };
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

// Descrições curtas por command — viram o campo `description` do TOML lido por Gemini/Antigravity.
const COMMAND_DESCRIPTIONS = {
  'start.md': 'Brainstorm estruturado -> brainstorm.md (passo 1 do fluxo KSDD)',
  'spec.md': 'brainstorm.md -> SPEC.md completo (passo 2)',
  'tech.md': 'SPEC.md -> architecture.md (passo 3, opcional)',
  'design.md': 'SPEC.md -> DESIGN.md no formato Google Stitch (passo 4)',
  'new:feature.md': 'Especifica uma nova feature e quebra em tasks implementaveis',
  'build:feature.md': 'Implementa as tasks de uma feature ponta-a-ponta (issue -> PR)',
  'build:all.md': 'Builda o projeto inteiro a partir do SPEC.md, feature por feature',
  'setup.md': 'Onboarding reverse-engineering de um projeto existente para KSDD',
  'archive.md': 'Arquiva features ja implementadas em .ksdd/archive/',
};

// 'new:feature.md' -> ['new','feature']; 'start.md' -> ['start']. Os ':' viram subdirs aninhados
// (Gemini deriva o namespace do path → /ksdd:new:feature), espelhando a invocação do Claude.
function antigravityCommandSegments(commandFile) {
  return commandFile.replace(/\.md$/i, '').split(':');
}

// Escapa uma string para um literal TOML básico (entre aspas duplas, single-line).
function tomlBasicString(s) {
  return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, '\\n') + '"';
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

// Quarto target: Google Antigravity / Gemini CLI. Cópia adaptada de installOpencode (ADR-011 — duplicação intencional).
// Modelo correto (comprovado pelo GSD): registra cada command como TOML nativo em ~/.gemini/commands/ksdd/<segs>.toml
// (`description` + `prompt`), com o corpo pesado bundlado em ~/.gemini/ksdd/commands/ e puxado via include @$HOME/...
// O mesmo diretório ~/.gemini/commands/ é lido tanto pela CLI/TUI quanto pelo IDE do Antigravity (e pelo gemini-cli).
function installAntigravity(tracked, out) {
  const isDefaultHome = ANTIGRAVITY_HOME === path.join(os.homedir(), '.gemini');
  // Referência usada nos includes do prompt. `$HOME/.gemini/ksdd` mantém o TOML portátil no caso default;
  // com ANTIGRAVITY_HOME custom, usa o caminho absoluto (o `$HOME` não apontaria pro bundle).
  const bundleRef = isDefaultHome ? '$HOME/.gemini/ksdd' : ANTIGRAVITY_BUNDLE_DIR;
  const bodyDir = path.join(ANTIGRAVITY_BUNDLE_DIR, 'commands');

  ensureDir(ANTIGRAVITY_COMMANDS_DIR);
  ensureDir(bodyDir);
  for (const file of COMMAND_FILES) {
    const src = path.join(PKG_ROOT, 'commands', file);
    if (!fs.existsSync(src)) continue;

    // 1) Corpo do command no bundle, referenciado pelo prompt via include.
    const bodyName = agentPromptBasename(file); // ksdd-new-feature.md
    copyFile(src, path.join(bodyDir, bodyName));
    tracked.push(path.join(bodyDir, bodyName));

    // 2) TOML nativo Gemini/Antigravity em commands/ksdd/<segs>.toml (segs aninhados → /ksdd:new:feature).
    const segments = antigravityCommandSegments(file);
    const tomlPath = path.join(ANTIGRAVITY_COMMANDS_DIR, ...segments) + '.toml';
    const desc = COMMAND_DESCRIPTIONS[file] || ('Comando KSDD ' + segments.join(':'));
    const prompt = [
      '@' + bundleRef + '/commands/' + bodyName,
      '',
      'Contexto canonico: templates em ' + bundleRef + '/references/ e agents em ' + bundleRef + '/agents/ '
        + '(ver ' + bundleRef + '/AGENTS.md). Respeite os approval gates obrigatorios.',
      '',
      'Argumentos do usuario: {{args}}',
    ].join('\n');
    const toml = 'description = ' + tomlBasicString(desc) + '\n'
               + 'prompt = ' + tomlBasicString(prompt) + '\n';
    ensureDir(path.dirname(tomlPath));
    fs.writeFileSync(tomlPath, toml);
    tracked.push(tomlPath);
    out('  ' + green('✓') + ' antigravity ' + dim('~/.gemini/commands/ksdd/') + segments.join('/') + '.toml  '
        + dim('/ksdd:' + segments.join(':')));
  }

  // Bundle de references/agents + docs (compartilhado; referenciado pelos prompts).
  ensureDir(ANTIGRAVITY_BUNDLE_DIR);
  for (const sub of ['references', 'agents']) {
    const src = path.join(PKG_ROOT, sub);
    if (fs.existsSync(src)) {
      copyDir(src, path.join(ANTIGRAVITY_BUNDLE_DIR, sub), tracked);
      out('  ' + green('✓') + ' antigravity ' + dim('~/.gemini/ksdd/') + sub + '/');
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
    out('  ' + green('✓') + ' antigravity ' + dim('~/.gemini/ksdd/') + 'AGENTS.md');
  } else {
    out('  ' + yellow('aviso:') + ' references/antigravity-AGENTS.md ausente — ksdd/AGENTS.md pulado');
  }
}

function cmdInstall(args) {
  const silent = args.flags.has('quiet') || args.flags.has('silent');
  const postinstall = args.flags.has('postinstall');
  const withCodex = args.flags.has('codex') || (postinstall && process.env.KSDD_WITH_CODEX === '1');
  const withOpencode = args.flags.has('opencode') || (postinstall && process.env.KSDD_WITH_OPENCODE === '1');
  const withAntigravity = args.flags.has('antigravity') || (postinstall && process.env.KSDD_WITH_ANTIGRAVITY === '1');
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
  out(bold('KSDD') + ' — instalando em ' + targetsLabel.join(' + '));

  const prev = normalizeManifest(loadManifest());
  const prevClaude = (prev && prev.targets && prev.targets.claude) || [];
  const prevCodex = (prev && prev.targets && prev.targets.codex) || [];
  const prevOpencode = (prev && prev.targets && prev.targets.opencode) || [];
  const prevAntigravity = (prev && prev.targets && prev.targets.antigravity) || [];

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

  const manifest = {
    version: require('../package.json').version,
    installedAt: new Date().toISOString(),
    pkgRoot: PKG_ROOT,
    targets: {
      claude: claudeTracked,
      codex: codexTracked,
      opencode: opencodeTracked,
      antigravity: antigravityTracked,
    },
  };
  saveManifest(manifest);
  out('');

  const targetNames = ['Claude Code'];
  const counts = [claudeTracked.length];
  if (withCodex) { targetNames.push('Codex'); counts.push(codexTracked.length); }
  if (withOpencode) { targetNames.push('opencode'); counts.push(opencodeTracked.length); }
  if (withAntigravity) { targetNames.push('Google Antigravity'); counts.push(antigravityTracked.length); }

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
    tail += '\n' + green('Integração Google Antigravity:') + ' reinicie o Antigravity (CLI/TUI ou IDE) e use ' + bold('/ksdd:start') + ' (commands em ~/.gemini/commands/ksdd/, bundle em ~/.gemini/ksdd/).';
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
    // Fallback Antigravity: remove o namespace de commands `commands/ksdd/` + bundle, por convenção.
    // Nunca toca em `commands/` (compartilhado com gsd e outros namespaces) nem em `~/.gemini/` em si.
    removePath(ANTIGRAVITY_COMMANDS_DIR);
    removePath(ANTIGRAVITY_BUNDLE_DIR);
    pruneEmptyDirs(ANTIGRAVITY_COMMANDS_DIR);
    pruneEmptyDirs(ANTIGRAVITY_BUNDLE_DIR);
    return;
  }

  const all = [
    ...(prev.targets && prev.targets.claude ? prev.targets.claude : []),
    ...(prev.targets && prev.targets.codex ? prev.targets.codex : []),
    ...(prev.targets && prev.targets.opencode ? prev.targets.opencode : []),
    ...(prev.targets && prev.targets.antigravity ? prev.targets.antigravity : []),
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
  // Prune restrito aos subdirs KSDD do Antigravity — nunca subir para ~/.gemini/ nem mexer em ~/.gemini/commands/
  // (compartilhado com gsd e outros namespaces). `commands/ksdd/` é nosso e some inteiro quando esvaziado.
  pruneEmptyDirs(ANTIGRAVITY_BUNDLE_DIR);
  pruneEmptyDirs(ANTIGRAVITY_COMMANDS_DIR);

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
  log('  Claude       : ' + cl.length + ' arquivos — ' + dim(COMMANDS_DIR));
  log('  Codex        : ' + cx.length + ' arquivos — prompts ' + dim(CODEX_PROMPTS_DIR) + ' · skill ' + dim(AGENTS_SKILLS_KSDD));
  if (oc.length > 0) {
    log('  opencode     : ' + oc.length + ' arquivos — commands ' + dim(OPENCODE_COMMANDS_DIR) + ' · bundle ' + dim(OPENCODE_BUNDLE_DIR));
  }
  if (ag.length > 0) {
    log('  antigravity  : ' + ag.length + ' arquivos — commands ' + dim(ANTIGRAVITY_COMMANDS_DIR) + ' · bundle ' + dim(ANTIGRAVITY_BUNDLE_DIR));
  }
}

function cmdHelp() {
  log(bold('ksdd') + ' — instalador KSDD para Claude Code, Codex, opencode e Google Antigravity\n');
  log('Uso:');
  log('  ksdd install               Copia commands e skills para ~/.claude/');
  log('  ksdd install --codex       Também instala prompts em ~/.codex/prompts/ e skill em ~/.agents/skills/ksdd/');
  log('  ksdd install --opencode    Também instala commands + bundle em ~/.config/opencode/');
  log('  ksdd install --antigravity Também instala commands TOML em ~/.gemini/commands/ksdd/ + bundle (CLI/TUI + IDE)');
  log('  ksdd uninstall             Remove arquivos previamente instalados');
  log('  ksdd status                Mostra estado da instalação');
  log('  ksdd help                  Esta mensagem');
  log('');
  log('  As flags são combináveis: ksdd install --codex --opencode --antigravity');
  log('');
  log('Variáveis de ambiente:');
  log('  KSDD_SKIP_POSTINSTALL=1   Pula o postinstall do npm');
  log('  KSDD_WITH_CODEX=1         Equivale a --codex no postinstall (npm install)');
  log('  KSDD_WITH_OPENCODE=1      Equivale a --opencode no postinstall');
  log('  KSDD_WITH_ANTIGRAVITY=1   Equivale a --antigravity no postinstall');
  log('  CODEX_HOME                Pasta do Codex (default: ~/.codex)');
  log('  OPENCODE_HOME             Pasta do opencode (default: ~/.config/opencode)');
  log('  ANTIGRAVITY_HOME          Pasta do Antigravity (default: ~/.gemini)');
  log('');
  log('Flags:');
  log('  --quiet           Silencia a saída');
  log('');
  log('Após install (invocação por agente):');
  log('  Claude/Antigravity ' + dim('/ksdd:start') + '   Codex ' + dim('/prompts:ksdd-start') + '   opencode ' + dim('/ksdd-start'));
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
