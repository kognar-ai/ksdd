---
id: 015
title: Atualizar commands/build:feature.md — detecção de slug arquivado no pre-flight
status: para implementar
feature: archive-features
area: backend
priority: P0
estimate: S
depends_on: [011]
feature_refs:
  - ".ksdd/features/FEATURE-archive-features.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-archive-features.md#51-superfícies-modificadas"
spec_refs:
  - ".ksdd/specs/SPEC.md#72-slash-commands-claude-code"
arch_refs: []
---

# 015 — Atualizar `commands/build:feature.md` para detectar slug arquivado

## Objetivo
Adicionar ao pre-flight do `/ksdd:build:feature` a detecção de slug arquivado em `.ksdd/archive/raw/[slug]/` e apresentar 3-way fork: (a) consultar `ARCHIVE.md`, (b) restaurar via `/ksdd:archive --restore [slug]`, (c) abortar.

## Escopo
- Editar `commands/build:feature.md` adicionando seção "Detecção de slug arquivado" no pre-flight (seção 0 do command), logo após a resolução do argumento e antes da leitura da task.
- Comportamento:
  - Se o slug resolvido (após parse do argumento) tem entrada em `.ksdd/archive/raw/[slug]/`, parar antes de qualquer modificação.
  - Apresentar 3 opções via `ask_user_input_v0`: (a) abrir `.ksdd/archive/ARCHIVE.md` na seção do slug para consulta, (b) restaurar com `/ksdd:archive --restore [slug]` e re-rodar `/ksdd:build:feature` depois, (c) abortar.
  - **Nunca** restaurar automaticamente.
- Documentar no command que essa checagem roda antes do `git status` (não-destrutivo — só leitura) para falhar rápido.
- Adicionar nota na seção "Anti-patterns" do command: "❌ Tentar implementar slug arquivado sem confirmação. → Use --restore explicitamente se quiser reabrir."

## Fora de escopo
- Atualizar `commands/new:feature.md` (task 014).
- Atualizar `commands/build:all.md` (task 016).
- Criar `commands/archive.md` (task 011).
- Implementar restore (responsabilidade do `/ksdd:archive`, task 011).

## Critérios de aceitação
- [ ] `commands/build:feature.md` tem bloco "Detecção de slug arquivado" antes do `git status` no pre-flight.
- [ ] Bloco apresenta as 3 opções com texto explícito.
- [ ] Command instrui leitura de `.ksdd/archive/ARCHIVE.md` apenas (sem tentar abrir editor automaticamente — só texto da seção via `view`).
- [ ] Anti-pattern documentado na seção apropriada.
- [ ] Idempotência: rodar `/ksdd:build:feature [slug-ativo]` em projeto sem `.ksdd/archive/` continua funcionando sem warning indevido.
- [ ] Grep `grep -n "archive\|arquivad" commands/build:feature.md` retorna ocorrências apenas nos blocos novos.

## Notas técnicas
- A detecção precisa rodar após o parse do argumento (que pode ser ID de task, slug parcial, etc.) para identificar a feature correta.
- Caso o argumento seja um ID de task (e a task vive em `.ksdd/archive/raw/[slug]/tasks/`), o comportamento deve ser idêntico: bloquear com fork.
- Manter o tom direto típico dos commands KSDD (SPEC seção 3.5).

## Riscos / dependências externas
- Edge case: usuário roda `/ksdd:build:feature --all` com um slug arquivado misturado no contexto. Fluxo do `--all` (seção "Quando implementar --all" do command) precisa também ignorar features arquivadas ao montar lista. Verificar se esse comportamento já está coberto pelas mudanças propostas ou exige passo extra.
