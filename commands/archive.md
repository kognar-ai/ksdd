---
description: Arquiva features já implementadas (individualmente, em lote ou via --all-eligible) movendo os artefatos brutos para .ksdd/archive/raw/[slug]/ e consolidando um resumo cronológico em .ksdd/archive/ARCHIVE.md. Suporta --restore para reverter e --dry-run para preview. Critério de elegibilidade: todas as tasks com status `concluída` ou `cancelada`.
argument-hint: "[slug] | [slug-a] [slug-b] ... | --all-eligible | --restore [slug] | --dry-run (combinável)"
allowed-tools: view, create_file, str_replace, ask_user_input_v0, Bash, list_directory, Glob, Grep
---

# /ksdd:archive — Arquivar features implementadas

Você é o curador de histórico do KSDD. Move features prontas de `.ksdd/features/` + `.ksdd/tasks/feature-[slug]/` para `.ksdd/archive/raw/[slug]/` e gera/atualiza um resumo cronológico em `.ksdd/archive/ARCHIVE.md`.

**Princípio:** archive ≠ delete. O conteúdo bruto sempre vive em `raw/[slug]/`; o resumo cronológico fica em `ARCHIVE.md`. Toda operação é reversível via `--restore`.

## Pré-flight — checagem de update (uma vez por sessão)

Se você ainda **não** executou a checagem de update nesta conversa e `KSDD_SKIP_UPDATE_CHECK` não está setado, siga `references/update-check.md` **antes** de prosseguir. A checagem é **não-bloqueante**: em qualquer erro, offline ou `npm` ausente, ignore em silêncio e continue este command normalmente. Nunca repita a checagem se já a fez nesta conversa.

## Idioma (obrigatório)

Siga `references/language-policy.md` — mensagens do command, conteúdo de `ARCHIVE.md` e perguntas no idioma dos artefatos KSDD existentes e da conversa; não assuma pt-BR. O template canônico `references/archive-template.md` tem placeholders neutros.

## Argumentos

`$ARGUMENTS` aceita 5 modos (mutuamente exclusivos, exceto `--dry-run` que é combinável):

| Modo | Sintaxe | Comportamento |
|------|---------|---------------|
| Individual | `/ksdd:archive [slug]` | Arquiva uma feature. |
| Lote | `/ksdd:archive [slug-a] [slug-b] [...]` | Arquiva múltiplas em ordem dos argumentos (última fica no topo de ARCHIVE.md). |
| Massa | `/ksdd:archive --all-eligible` | Arquiva todas as features cujo critério de elegibilidade passa. Lista as não-elegíveis com razão. |
| Reverso | `/ksdd:archive --restore [slug]` | Restaura uma feature arquivada (move `raw/[slug]/` de volta + remove seção de ARCHIVE.md). |
| Preview | `--dry-run` (combinável) | Combinável com qualquer um dos 4 modos acima. Executa toda validação sem mover arquivos nem escrever em ARCHIVE.md. |

**Validação de slug:** todo slug deve casar com regex `^[a-z0-9][a-z0-9-]*$`. Aborte com mensagem clara antes de qualquer operação se inválido.

## Pré-requisitos

- O projeto-alvo deve ter ao menos `.ksdd/features/FEATURE-*.md` (ou path legado `docs/FEATURE-*.md`). Sem features, o command encerra com mensagem informativa.
- Não há dependência de `SPEC.md` — archive opera sobre features já implementadas.

## Paths dos artefatos

| Artefato | Leitura (em ordem, com fallback) | Movido para (archive) |
|---|---|---|
| `FEATURE-[slug].md` | `.ksdd/features/FEATURE-[slug].md` → `docs/FEATURE-[slug].md` → raiz `FEATURE-[slug].md` | `.ksdd/archive/raw/[slug]/FEATURE-[slug].md` |
| tasks `NNN-*.md` | `.ksdd/tasks/feature-[slug]/` → `docs/tasks/feature-[slug]/` | `.ksdd/archive/raw/[slug]/tasks/` |
| `ARCHIVE.md` | `.ksdd/archive/ARCHIVE.md` (criado se não existir) | (em-place — alterado) |

**Warning de legado:** se a feature estiver em `docs/` (raiz ou tasks), emita warning amarelo:

> ⚠ Detectado `<path-legado>` em layout pré-0.6.0. Recomenda-se migrar para `.ksdd/` antes de arquivar. O archive prossegue movendo do path legado para `.ksdd/archive/raw/[slug]/`, mas o resultado mistura layouts.

**Layout do `.ksdd/archive/` (criado on-demand):**

```
.ksdd/archive/
├── ARCHIVE.md                          # índice cronológico decrescente
└── raw/
    └── [slug]/
        ├── FEATURE-[slug].md
        └── tasks/
            ├── README.md
            ├── NNN-*.md
            └── .context/
                └── NNN-context.md
```

## Critério de elegibilidade

Uma feature é **elegível** para archive quando:

- O arquivo `FEATURE-[slug].md` existe (em algum dos paths possíveis).
- Todas as tasks em `.ksdd/tasks/feature-[slug]/NNN-*.md` (ou `docs/tasks/feature-[slug]/` legado) têm frontmatter `status: concluída` **ou** `status: cancelada`.

Se houver qualquer task com `status: para implementar`, `em andamento`, `em revisão` ou `bloqueada`: aborte para o slug com mensagem listando IDs e status atuais:

```
✗ [slug] tem 2 task(s) não-concluída(s):
  - 015 (em revisão)
  - 018 (em andamento)
Resolva antes de arquivar.
```

## Fluxo principal — Modo Individual (`/ksdd:archive [slug]`)

### 1. Resolver e validar

1. Valide o slug com regex.
2. Verifique existência de `FEATURE-[slug].md` (`.ksdd/` → `docs/` → raiz). Se ausente, aborte com mensagem listando features existentes.
3. Verifique se `.ksdd/archive/raw/[slug]/` **não** existe (sem re-archive). Se existir, aborte: "Slug [slug] já arquivado em [data inferida do ARCHIVE.md]. Use `--restore` se quiser reabrir."
4. Liste tasks do slug (em ambos os paths, mas elas só devem viver em um). Leia frontmatter de cada uma.
5. Aplique critério de elegibilidade. Se bloqueado, aborte com lista de bloqueadoras.

### 2. Preview e approval gate

Apresente ao usuário:

```
Pronto para arquivar [slug]:
  · FEATURE: <path>/FEATURE-[slug].md
  · Tasks: N arquivos (NNN a MMM)
  · Destino: .ksdd/archive/raw/[slug]/
  · ARCHIVE.md: nova seção no topo (data: YYYY-MM-DD)
```

Use `ask_user_input_v0` para confirmação binária. Se negado, encerre sem mexer em nada.

### 3. Executar move

1. `mkdir -p .ksdd/archive/raw/[slug]/tasks/`.
2. Use `git mv` se a árvore for git (preserva história), senão `mv`. **Importante:** mova o **diretório inteiro**, não `dir/*` (globs shell ignoram arquivos hidden como `.context/`):
   - `git mv .ksdd/features/FEATURE-[slug].md .ksdd/archive/raw/[slug]/FEATURE-[slug].md`
   - `git mv .ksdd/tasks/feature-[slug] .ksdd/archive/raw/[slug]/tasks` (renomeia o diretório — preserva `.context/`)
3. Se houver tasks em `docs/tasks/feature-[slug]/` (layout legado), aplique o mesmo `git mv` ao path legado.
4. Verifique que diretórios de origem foram removidos (renomeados pelo `git mv`).

### 4. Atualizar `ARCHIVE.md`

1. Verifique se `.ksdd/archive/ARCHIVE.md` existe. Se não:
   - Leia `references/archive-template.md`.
   - Crie `.ksdd/archive/ARCHIVE.md` com o **header global** do template (que inclui propósito, pointer para raw/, e instrução de uso de `/ksdd:archive --restore`).
2. Leia o conteúdo movido em `raw/[slug]/FEATURE-[slug].md`:
   - Extraia o título (linha `# Feature: ...`).
   - Extraia o objetivo (1º parágrafo da seção `## 1. Motivação` → `### 1.1`).
   - Extraia prioridade do header (`**Prioridade:** ...`).
3. Leia `raw/[slug]/tasks/README.md` para extrair lista de tasks (formato `NNN | Título | Área | Prioridade | Estimativa | Status | Depende de`).
4. Extraia checklist de critérios de aceite da seção `## 10. Critérios de Aceite` do FEATURE.
5. Preencha o template de seção (`references/archive-template.md`) substituindo placeholders:
   - `[SLUG]` → slug
   - `[TITLE]` → título extraído
   - `[ARCHIVED_DATE]` → data atual (YYYY-MM-DD)
   - `[PRIORITY]` → prioridade
   - `[OBJECTIVE]` → parágrafo extraído
   - `[TASKS_LIST]` → lista compacta `- NNN — Título (área) — status final`
   - `[ACCEPTANCE_CRITERIA]` → checklist preservado
   - `[RAW_POINTER]` → `.ksdd/archive/raw/[slug]/`
6. Insira a nova seção logo após o header global (no topo do índice cronológico), antes de qualquer outra seção existente. Use `str_replace` com âncora confiável (a marker `<!-- new entries appear below -->` no header global do template).

### 5. Mensagem final (verde)

```
✓ Feature [slug] arquivada.
  Resumo: .ksdd/archive/ARCHIVE.md
  Raw:    .ksdd/archive/raw/[slug]/
```

## Fluxo — Modo Lote (`/ksdd:archive slug-a slug-b ...`)

1. Valide todos os slugs antes de qualquer operação.
2. Aplique critério de elegibilidade em todos. Se **algum** bloqueado, aborte tudo (não arquiva parcial nesta fase de validação).
3. Apresente preview consolidado: tabela com slug, número de tasks, prioridade, tamanho estimado.
4. Use `ask_user_input_v0` para confirmação única.
5. Execute archive de cada slug sequencialmente na ordem dos argumentos. Append à `ARCHIVE.md` na ordem — último argumento fica no topo final.
6. Se algum slug **falhar durante o move** (ex: permissão de filesystem), arquiva o que conseguiu e reporta no final qual slug falhou. **Sem rollback automático** (atomicidade por slug, não por lote).
7. Mensagem final: `✓ N feature(s) arquivada(s). M task(s) movida(s). ARCHIVE.md atualizado.`

## Fluxo — Modo `--all-eligible`

1. Varra `.ksdd/features/FEATURE-*.md` (e fallbacks `docs/`, raiz) listando todos os slugs.
2. Para cada um, calcule elegibilidade.
3. Apresente lista com duas seções:
   ```
   Elegíveis (N):
     ✓ slug-a  (5 tasks, P0)
     ✓ slug-b  (10 tasks, Alta)
   
   Não-elegíveis (M):
     ⏭ slug-c  — 2 tasks em revisão
     ⏭ slug-d  — 1 task bloqueada
   ```
4. Se zero elegíveis, encerre com mensagem informativa (não é erro).
5. `ask_user_input_v0` para confirmar archive das elegíveis.
6. Execute em ordem alfabética por slug (última no topo de ARCHIVE.md).
7. Reuse o restante do fluxo Lote.

## Fluxo — Modo `--restore`

### 1. Pré-validação

1. Valide slug.
2. Verifique que `.ksdd/archive/raw/[slug]/FEATURE-[slug].md` existe. Se não, aborte: "Slug [slug] não encontrado em .ksdd/archive/raw/. Veja `.ksdd/archive/ARCHIVE.md` para slugs arquivados."
3. Verifique que `.ksdd/features/FEATURE-[slug].md` **não** existe. Se existir, aborte: "Conflito: `.ksdd/features/FEATURE-[slug].md` já existe. Resolva manualmente antes de restaurar."
4. Verifique que `.ksdd/tasks/feature-[slug]/` **não** existe. Mesmo tratamento.

### 2. Preview e approval

```
Pronto para restaurar [slug]:
  · De: .ksdd/archive/raw/[slug]/
  · Para: .ksdd/features/FEATURE-[slug].md + .ksdd/tasks/feature-[slug]/
  · Remove seção de ARCHIVE.md (entrada datada YYYY-MM-DD)
```

### 3. Executar restore

1. `mkdir -p .ksdd/features/ .ksdd/tasks/feature-[slug]/`.
2. `git mv` (ou `mv`):
   - `raw/[slug]/FEATURE-[slug].md` → `.ksdd/features/FEATURE-[slug].md`
   - todo conteúdo de `raw/[slug]/tasks/` → `.ksdd/tasks/feature-[slug]/`
3. Remova diretório `raw/[slug]/tasks/` e `raw/[slug]/` (vazios após o move).
4. Atualize `ARCHIVE.md`: remova todas as seções cujo header case com a regex `^## \[?slug-real\]?\s+—\s+\d{4}-\d{2}-\d{2}\s*$` (escapando regex). Use `str_replace` com âncoras precisas (do `## [slug] — ...` até o início da próxima seção `## ` ou até EOF).
5. Se `ARCHIVE.md` ficou com apenas o header global (zero entradas), considere remover o arquivo (opcional — manter é também aceitável).

### 4. Mensagem final

```
✓ Feature [slug] restaurada.
  Próximo: /ksdd:build:feature [slug] (se quiser continuar implementação)
```

## Fluxo — Modo `--dry-run` (combinável)

Quando `--dry-run` aparece em qualquer argv:

1. Execute **toda** a validação dos modos acima (resolução, elegibilidade, conflitos).
2. **Não mova arquivos. Não escreva em ARCHIVE.md.**
3. Imprima exatamente o que seria feito: paths de origem, paths de destino, número de seções a adicionar/remover, slugs afetados.
4. Banner final em dim/azul:

```
[dry-run] Nenhuma alteração aplicada. Rode sem --dry-run para confirmar.
```

## Mensagens canônicas (referência rápida)

| Cenário | Cor | Mensagem |
|---|---|---|
| Archive sucesso | verde | `✓ Feature [slug] arquivada. Resumo: .ksdd/archive/ARCHIVE.md · Raw: .ksdd/archive/raw/[slug]/` |
| Restore sucesso | verde | `✓ Feature [slug] restaurada. Próximo: /ksdd:build:feature [slug]` |
| Legado detectado | amarelo | `⚠ Detectado [slug] em docs/ (path legado). Migre para .ksdd/ antes de arquivar.` |
| Elegibilidade falha | vermelho | `✗ [slug] tem N task(s) não-concluída(s): NNN (status), ... . Resolva antes de arquivar.` |
| Conflito restore | vermelho | `✗ Não posso restaurar [slug]: .ksdd/features/FEATURE-[slug].md já existe. Resolva manualmente.` |
| Re-archive | vermelho | `✗ Slug [slug] já arquivado. Use --restore se quiser reabrir.` |
| Slug inválido | vermelho | `✗ Slug inválido "[slug]". Use kebab-case: ^[a-z0-9][a-z0-9-]*$.` |
| Slug inexistente | vermelho | `✗ FEATURE-[slug].md não encontrado. Features disponíveis: ...` |
| Dry-run banner | dim/azul | `[dry-run] Nenhuma alteração aplicada.` |

## Anti-patterns

- ❌ **Auto-restaurar.** `--restore` é sempre explícito. Outros commands (`new:feature`, `build:feature`) detectam slug arquivado e apresentam fork — nunca restauram sozinhos.
- ❌ **Deletar permanentemente.** Archive move, não deleta. Para deletar, usuário faz `rm -rf .ksdd/archive/raw/[slug]/` manualmente.
- ❌ **Arquivar feature em andamento.** Critério é estrito: 100% das tasks `concluída`/`cancelada`. Se quer arquivar uma feature abandonada, marque as tasks como `cancelada` primeiro.
- ❌ **Modificar conteúdo durante o archive.** Move é literal — FEATURE.md e tasks ficam idênticos. Edição manual em `raw/` é desencorajada (`--restore` move tal qual está).
- ❌ **Forçar lote com slug bloqueado.** Modo lote aborta tudo se algum slug é inelegível na validação. Faça archive individual para resolver caso a caso.
- ❌ **Rodar sem dry-run quando o resultado é incerto.** Em projeto novo ou com fallbacks legados, prefira `--dry-run` primeiro.
- ❌ **Confundir ARCHIVE.md com changelog do produto.** ARCHIVE.md é cronológico de features KSDD entregues — não substitui `CHANGELOG.md` (que documenta versões do pacote).

## Checkpoint final

> Resumo da operação:
> - Modo: [individual | lote | --all-eligible | --restore]
> - Slugs afetados: [...]
> - Tasks movidas: N (ou M removidas em restore)
> - `.ksdd/archive/ARCHIVE.md`: +X seções (ou -Y em restore)
>
> Próximos passos sugeridos:
> - Inspecionar `.ksdd/archive/ARCHIVE.md` para validar resumo
> - Commitar mudanças: `git add .ksdd/archive .ksdd/features .ksdd/tasks && git commit -m "chore(archive): arquiva [slugs]"`

## Iteração

- **Re-archive (mesmo slug, datas diferentes):** se houve archive → restore → archive, a nova entrada em ARCHIVE.md tem data atual; a entrada antiga já foi removida pelo restore anterior. Sem conflito.
- **Limpeza de ARCHIVE.md:** se a ordem cronológica ficar inconsistente após muitos restore/archive, o usuário pode editar manualmente — o command só insere no topo e remove por âncora.
- **Slug renomeado:** archive seguido de `--restore` mantém o slug original. Para renomear, faça restore + edição manual + novo archive.

## Falhas e abortos

- **Permissão de filesystem:** reporte path exato e prossiga com próximos slugs (em lote/all-eligible); aborte se for o único.
- **Conflito de path em `git mv`:** se a árvore tem mudanças não-commitadas que conflitam, peça ao usuário commitar ou stashar antes.
- **ARCHIVE.md corrompido (sem âncoras esperadas):** aborte com mensagem instruindo o usuário a inspecionar o arquivo. Não tente "consertar" automaticamente.
- **Template `references/archive-template.md` ausente:** aborte com instrução de rodar `ksdd install` (skill desatualizada).

## Read-only durante archive

Durante o archive, **não** modifique:

- `.ksdd/specs/SPEC.md`, `.ksdd/specs/architecture.md`, `.ksdd/specs/brainstorm.md`, `.ksdd/specs/DESIGN.md`
- Conteúdo de `FEATURE-[slug].md` ou tasks (move literal)
- `CHANGELOG.md`, `README.md`, `package.json` do projeto-alvo

A única escrita é em `.ksdd/archive/ARCHIVE.md` (criação ou append/remove de seção).
