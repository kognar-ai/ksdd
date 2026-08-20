# Convenção de integrações do KSDD

Este diretório (`references/integrations/`) reúne os **docs de integração** do KSDD — um
por ferramenta externa que se conecta ao fluxo spec-driven (design tools, camadas de
craft/QA, exportadores). O impeccable (`references/integrations/impeccable.md`) é a
**primeira** integração documentada; Figma, v0 e Pencil (Fase 6 do roadmap) seguem o mesmo
padrão descrito aqui.

> **Regra de ouro:** integrações do KSDD são **handoff/opt-in documentado**, **nunca
> dependência de código.** O KSDD não sabe, em runtime, se você tem a ferramenta instalada —
> ele só descreve como costurar o handoff *se* você a usa.

## Por que "conteúdo-only", sem framework de plugins

Uma integração aqui é **só um arquivo Markdown**. Não há registry, não há detecção rígida,
não há `require()`, não há entrada nova no `bin/ksdd.js`. Isso é deliberado (ver ADR-014 em
`.ksdd/specs/architecture.md`):

- **Preserva ADR-001 (zero dependências runtime).** Nenhuma integração adiciona pacote ao
  `package.json` nem mexe em `engines.node`. Requisitos de versão da ferramenta externa
  (ex.: um Node mais novo) são problema do usuário dela, não do KSDD (que segue Node ≥16).
- **Preserva ADR-003 (conteúdo distribuído).** A "lógica" da integração vive no Markdown que
  o agente lê — igual aos slash commands.
- **Não incorre na dívida ADR-010/011/012.** Uma integração **não** é um novo *target de
  instalação* nem um novo *slash command*, então **não** dispara o refator
  `installTarget(targetConfig)` genérico (o gatilho do ADR-012 — refator inescapável antes do
  6º target — permanece intocado). Mesmo espírito conteúdo-only do ADR-013.
- **Mantém as fronteiras de licença limpas.** Um doc de integração **linka e referencia** a
  ferramenta externa; **nunca vendoriza** (copia) o conteúdo dela. Assim o KSDD (AGPL-3.0)
  não mistura conteúdo de terceiros com licença diferente (ex.: Apache-2.0).

## Como um doc de integração é distribuído

`references/` é copiado **recursivamente** por `copyDir(references, …)` dentro de cada uma das
5 funções de instalação (`installClaude/Codex/Opencode/Antigravity/Copilot` em `bin/ksdd.js`).
Logo, **adicionar um arquivo em `references/integrations/` já o distribui automaticamente** para
o bundle de skill de todos os targets, sem tocar o CLI:

- `~/.claude/skills/ksdd/references/integrations/`
- `~/.agents/skills/ksdd/references/integrations/` (Codex)
- `~/.config/opencode/ksdd/references/integrations/`
- `~/.gemini/ksdd/references/integrations/` (Antigravity)
- `<vscode-user>/ksdd/references/integrations/` (Copilot)

Como cada arquivo copiado entra no `tracked[]` do manifest, o `uninstall` também o remove
limpo. **Nada muda em `bin/ksdd.js`**: nenhuma entrada nova em `COMMAND_FILES`, nenhuma função
`install*` nova.

## O que um doc de integração precisa conter

Todo `references/integrations/<tool>.md` deve cobrir, na medida em que se aplica à ferramenta:

1. **O que é a ferramenta e onde ela encaixa no fluxo KSDD.** Deixe explícito qual fase do
   KSDD (`brainstorm → SPEC → architecture → DESIGN` → build) ela complementa, sem sobrepor
   responsabilidade. O KSDD produz o *contrato*; a integração atua *depois* (no design ou no
   código), onde o KSDD hoje não toca.
2. **Quando acionar cada command/superfície da ferramenta, por fase** (design vs build).
3. **Garantia de compatibilidade** (quando houver troca de artefato): qual formato é
   compartilhado e qual é o **teste objetivo** de compat (ex.: passar um linter).
4. **Path bridge** (se a ferramenta espera artefatos em local diferente de `.ksdd/specs/`):
   a ponte confiável (symlink/`cp`) e, se a ferramenta aceitar flag de path, a alternativa.
   A convenção KSDD (`.ksdd/specs/`) permanece a **fonte da verdade**.
5. **Mapeamento de artefatos** KSDD → artefatos da ferramenta (de onde no SPEC/brainstorm/
   architecture/DESIGN cada campo é derivado). Respeite `references/language-policy.md`.
6. **Receitas de uso** — gates opcionais, comandos de validação, exemplos concretos.
7. **Frasado condicional/opt-in em todo o doc** ("se você usa <tool>…"), para que o fluxo
   KSDD nunca quebre para quem não a tem. **Sem detecção rígida obrigatória.**

## Como adicionar a próxima integração (Figma / v0 / Pencil / …)

1. Crie `references/integrations/<tool>.md` seguindo `impeccable.md` como exemplo de estrutura.
2. Se houver superfícies do fluxo a costurar (ex.: um bloco opt-in no checkpoint do
   `/ksdd:design` ou um gate opcional no `/ksdd:build:feature`), edite **o command
   correspondente** apontando para o novo doc — sem duplicar a lógica dentro do command.
3. **Não** adicione nada ao `bin/ksdd.js`. **Não** crie função `install*`. **Não** adicione
   dependência. O arquivo novo já cai no bundle de todos os targets via `copyDir`.
4. Registre a integração na seção "## Integrações" do `README.md` do repo.
5. Se a integração introduzir uma decisão arquitetural nova, registre um ADR em
   `.ksdd/specs/architecture.md` (a convenção em si já está coberta por ADR-014).

## Não-objetivos (o que uma integração NUNCA faz)

- ❌ Criar um command KSDD que "embrulhe" a ferramenta externa (acopla; use os commands
  nativos dela).
- ❌ Criar runtime/registry de plugins no CLI.
- ❌ Empacotar, vendorizar ou depender da ferramenta; alterar `engines.node`.
- ❌ Detecção rígida obrigatória que bloqueie o fluxo de quem não tem a ferramenta.
