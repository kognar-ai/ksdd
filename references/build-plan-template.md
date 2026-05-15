---
id: NNN
title: Título curto e imperativo da task
status: para implementar
feature: [slug-da-feature]
area: backend | frontend | infra | data-model | auth | billing | observability | qa | design
priority: P0 | P1 | P2
estimate: S | M | L
depends_on: [NNN, NNN]
feature_refs:
  - "docs/FEATURE-[slug].md#<seção>"
spec_refs:
  - "SPEC.md#<seção>"
arch_refs:
  - "architecture.md#<seção>"
---

# NNN — Título da task

## Objetivo

[Uma a duas frases dizendo o que essa task entrega de valor e por quê.
Conecte com o objetivo da feature e do produto.]

## Escopo

[Lista pontual do que está incluído. Concreto e verificável.]

- [Item 1 — arquivo ou endpoint ou componente específico]
- [Item 2]
- [Item 3]

## Fora de escopo

[O que explicitamente NÃO é parte desta task — evita scope creep.]

- [Item X — será coberto por task NNN]
- [Item Y — fora da v1 da feature]

## Critérios de aceitação

[Checklist de validação. Cada item deve ser objetivamente testável.]

- [ ] [Critério 1 — ex: "Endpoint GET /api/notifications retorna 200 com array de notificações do usuário autenticado"]
- [ ] [Critério 2 — ex: "Componente NotificationBell renderiza badge com count > 0"]
- [ ] [Critério 3 — ex: "Migration cria tabela notifications com índice em user_id"]
- [ ] Cobertura de testes onde aplicável

## Notas técnicas

[Decisões já tomadas, libs específicas, gotchas.
Cite seções de artefatos: "Ver architecture.md seção 3 (schema)".
Cite ADRs quando aplicável: "Ver ADR-003".]

- [Nota 1]
- [Nota 2]

## Riscos / dependências externas

[Coisas que podem travar a task. Vazio se não houver.]

- [Risco/dependência 1 — ex: "API de push do Firebase requer configuração de service account"]
- [Risco/dependência 2 — ex: "Decisão arquitetural pendente: WebSocket vs SSE para real-time"]
