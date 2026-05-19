---
id: 005
title: Atualizar commands/setup.md (reverse-engineering) com novo layout + detecção de legados
status: em revisão
feature: ksdd-folder-layout
area: backend
priority: P0
estimate: M
depends_on: [001, 002]
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#43-reverse-engineering-com-ksddsetup-em-projeto-existente"
spec_refs:
  - "SPEC.md#132-onboarding-em-projeto-existente-reverse-engineering"
arch_refs: []
---

# 005 — Atualizar `commands/setup.md` para novo layout

## Objetivo
Migrar fluxo de reverse-engineering para gerar artefatos diretamente em `.ksdd/specs/` e adicionar pre-flight inteligente para projetos com artefatos KSDD legados.

## Escopo
- Editar `commands/setup.md` para:
  - Pre-flight (Fase 0) detectar artefatos KSDD em três locais: `.ksdd/specs/`, raiz (legado), `docs/` (legado FEATURE).
  - Quando detectar legados, perguntar explicitamente (3 opções FEATURE 4.3):
    (a) gerar em `.ksdd/` separadamente; (b) sobrescrever após mover legados; (c) abortar.
  - Gerar `brainstorm.md`, `SPEC.md`, `architecture.md` (e `DESIGN.md` se frontend) em `.ksdd/specs/`.
  - Continuar respeitando flag `--artifacts` mas com escopo dos novos paths.
  - Atualizar resumo final (Fase 5) com paths novos.
- Atualizar exemplos de output esperado em todas as fases.

## Fora de escopo
- Mudar lógica de detecção de stack/produto/código/git (agents continuam iguais — task 007 atualiza textos pontuais).
- Implementar opção "(b) sobrescrever após mover legados" via shell — só descrever ao usuário o que fazer manualmente nesta v1.

## Critérios de aceitação
- [ ] Fase 0 detecta artefatos legados (raiz + docs/) e pergunta antes de prosseguir.
- [ ] Fase 4 gera todos artefatos em `.ksdd/specs/` quando projeto vazio.
- [ ] Fase 4 respeita escolha do usuário quando há legados.
- [ ] Fase 5 (resumo) mostra paths novos.
- [ ] Flag `--artifacts brainstorm,spec` gera só os pedidos no novo path.
- [ ] Mensagens "Reverse-engineered" no header dos artefatos gerados mantidas (formato igual).

## Notas técnicas
- A opção (b) ("sobrescrever após mover") deve dar comando shell concreto: `git mv brainstorm.md SPEC.md architecture.md .ksdd/specs/ 2>/dev/null; mv docs/FEATURE-*.md .ksdd/features/ 2>/dev/null` — sem executar, só sugerir.
- Cuidado: setup é o command mais longo (~25KB). Edit cirúrgico, não reescrever.

## Riscos / dependências externas
- Depende de tasks 001 e 002 terem definido o padrão de fallback que setup também precisa replicar.
