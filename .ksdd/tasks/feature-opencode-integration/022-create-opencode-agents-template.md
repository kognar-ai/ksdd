---
id: 022
title: Criar references/opencode-AGENTS.md (template novo bundlado em ~/.config/opencode/ksdd/AGENTS.md)
status: para implementar
feature: opencode-integration
area: data-model
priority: P0
estimate: S
depends_on: []
feature_refs:
  - ".ksdd/features/FEATURE-opencode-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-opencode-integration.md#5-impacto-em-telas-existentes"
  - ".ksdd/features/FEATURE-opencode-integration.md#61-novas-entidades"
spec_refs:
  - ".ksdd/specs/SPEC.md#43-templates-canônicos-references"
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#31-manifest-de-instalação-ksdd-manifestjson"
---

# 022 — Criar `references/opencode-AGENTS.md`

## Objetivo
Criar o template canônico `references/opencode-AGENTS.md` (~20-40 linhas) que é distribuído com o pacote e copiado para `~/.config/opencode/ksdd/AGENTS.md` no `installOpencode`. Espelha o papel do `codex-SKILL.md` (orientar o agente sobre o bundle) adaptado pro estilo opencode.

## Escopo
- Criar arquivo `references/opencode-AGENTS.md` no root de `references/` (mesmo nível que `codex-SKILL.md`, `feature-template.md`, etc.).
- Conteúdo (curto, ~20-40 linhas Markdown):
  - **Título:** `# KSDD — Kognar Spec-Driven Design & Development (bundle para opencode)`
  - **Parágrafo 1 — propósito:** o que é KSDD, que este bundle existe pra dar contexto canônico ao agente opencode quando os slash commands `/ksdd-*` são invocados.
  - **Parágrafo 2 — onde achar o quê:** `./references/` tem templates canônicos (brainstorm-template, spec-template, architecture-template, design-md-spec, feature-template, build-plan-template, archive-template, language-policy, approval-gates, personas-guide); `./agents/` tem helpers de estilo (interviewer, consolidator, critic, setup-analyst).
  - **Parágrafo 3 — convenções obrigatórias:**
    - Approval gates obrigatórios — `references/approval-gates.md` lista os 7 gates; nenhum comando encadeia sem aprovação humana explícita.
    - Idioma — `references/language-policy.md` é a fonte; commands seguem o idioma da conversa, não assumem pt-BR.
    - Perguntas em batch — máximo 3 perguntas estruturadas por rodada, complementadas com texto livre.
  - **Parágrafo 4 — fluxo padrão:** sequência `ksdd-start → ksdd-spec → ksdd-tech → ksdd-design`, seguida de `ksdd-new-feature` / `ksdd-build-feature` / `ksdd-build-all` por demanda; `ksdd-setup` para projetos existentes; `ksdd-archive` para arquivar features prontas.
  - **Parágrafo 5 — versão e atualização:** versão atual é a do `package.json` do pacote KSDD (será 0.8.0 após release desta feature); atualizar via `npm install -g @kognar/ksdd@latest`.
- Sem YAML frontmatter no início (opencode AGENTS.md não tem padrão obrigatório de frontmatter — manter Markdown puro, alinhado com docs https://opencode.ai/docs/agents/).
- Estilo: direto, técnico, opinativo (alinhado com SPEC seção 3.1). Sem floreio, sem emojis, sem exclamações.
- Documentação interna no próprio arquivo: pequena nota dim ao final tipo "_Arquivo gerado a partir de `references/opencode-AGENTS.md` do pacote @kognar/ksdd. Editar upstream._"

## Fora de escopo
- Integração com `installOpencode()` (feita na task 020 — esta task só cria o template).
- Atualizar `README.md` ou `INSTALL.md` mencionando o AGENTS.md bundle (task 026).
- Atualizar `architecture.md` registrando o novo arquivo em "templates canônicos" (task 024).
- Criar template equivalente para Claude (`claude-SKILL.md` ou similar) — fora de escopo: Claude tem skill loading nativo, não precisa.

## Critérios de aceitação
- [ ] Arquivo `references/opencode-AGENTS.md` existe no repo.
- [ ] Conteúdo cobre as 5 áreas listadas no Escopo (propósito, onde achar, convenções, fluxo, versão).
- [ ] Total entre 20 e 50 linhas (medido com `wc -l references/opencode-AGENTS.md`).
- [ ] Sem YAML frontmatter no topo.
- [ ] Sem emojis ou exclamações (alinhado com SPEC 3.1 e 3.4).
- [ ] Referências internas (`./references/`, `./agents/`) usam caminho relativo ao bundle (não path absoluto do pacote).
- [ ] Nota final indica origem upstream do arquivo.
- [ ] `installOpencode()` da task 020 consegue copiá-lo para `~/.config/opencode/ksdd/AGENTS.md` sem erro (validação integrada na task 027).

## Notas técnicas
- Espelhar **o tom e tamanho** de `references/codex-SKILL.md` (referência mais próxima). Não copiar o conteúdo cego — opencode não tem a estrutura `description: ...` que skill Codex usa.
- O arquivo é estático no pacote; não tem variáveis interpoladas em runtime. A versão (0.8.0) pode ser escrita como string fixa neste arquivo ou referenciada como "atual do `package.json`" pra evitar drift.
- Considerar a opção menos verbosa: referenciar package.json sem hardcode evita necessidade de atualizar o arquivo a cada release.

## Riscos / dependências externas
- Nenhuma dependência de código — task independente, pode ser feita em paralelo com 020, 023, 024, 025.
- Risco baixo: se opencode mudar convenção de `AGENTS.md` upstream (ex: passar a exigir frontmatter), retrabalho cosmético.
