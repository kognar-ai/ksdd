---
id: 058
title: Atualizar SPEC.md + architecture.md (ADR-014, env var, fluxo 13.5, integrações)
status: para implementar
feature: update-health-check
area: backend
priority: P1
estimate: M
depends_on: [056, 057]
feature_refs:
  - ".ksdd/features/FEATURE-update-health-check.md#7-impacto-na-superfície-cli-e-nos-commands"
  - ".ksdd/features/FEATURE-update-health-check.md#9-dependências-e-riscos"
spec_refs:
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
  - ".ksdd/specs/SPEC.md#135-atualização-da-própria-instalação"
  - ".ksdd/specs/SPEC.md#12-modelo-de-negócio-impacto-na-interface"
arch_refs:
  - ".ksdd/specs/architecture.md#5-integrações-externas"
  - ".ksdd/specs/architecture.md#42-variáveis-de-ambiente"
  - ".ksdd/specs/architecture.md#10-decisões-arquiteturais-significativas-adrs"
  - ".ksdd/specs/architecture.md#12-roadmap-de-implementação"
---

# 058 — Atualizar SPEC e architecture

## Objetivo
Refletir a nova checagem de update nos artefatos KSDD do próprio repo: SPEC (comportamento/produto) e architecture (decisão + integração + roadmap), incluindo a nova ADR-014 que fixa "quem checa é o agente, a CLI segue offline".

## Escopo — SPEC.md (`.ksdd/specs/SPEC.md`)
- **Seção 11** (Interações e Comportamentos): adicionar o comportamento "Health check de update (uma vez por sessão)" — não-bloqueante, silêncio quando atualizado/offline, opt-out.
- **Seção 13.5** (Atualização da própria instalação): registrar que a descoberta agora é "puxada" pelo aviso na 1ª invocação, além do `npm install -g @kognar/ksdd@latest` manual.
- **Seção 7.1** (CLI): mencionar `KSDD_SKIP_UPDATE_CHECK` na lista de env vars (honrada pelo agente, não pela CLI).
- **Seção 12** (Modelo de negócio / sem telemetria): uma frase deixando claro que a checagem lê o registry público e **não** é telemetria (nada enviado a servidores KSDD/Kognar).

## Escopo — architecture.md (`.ksdd/specs/architecture.md`)
- **Nova ADR-014** — checagem de update **agent-driven**: os commands instruem o agente a ler o manifest (`version`) e consultar o npm (`npm view`/`web_fetch`); a CLI `bin/ksdd.js` **não** ganha chamada de rede (preserva ADR-001/003). Registrar: sessão-only sem persistência de manifest, não-bloqueante, opt-out `KSDD_SKIP_UPDATE_CHECK`, reference de conteúdo distribuído sem função `install*` nova (mesma classe do ADR-013).
- **Seção 5** (Integrações Externas): a linha "KSDD não faz nenhuma chamada de rede em runtime" precisa de nota — o **CLI** continua sem rede; o **agente** passa a consultar o registry npm (leitura) ao seguir `references/update-check.md`. Reconciliar sem contradizer.
- **Seção 4.2** (Variáveis de ambiente): adicionar `KSDD_SKIP_UPDATE_CHECK`.
- **Seção 12** (Roadmap): marcar a entrega desta feature; registrar "throttle diário persistido" e "update na CLI (`ksdd status`)" como itens futuros (FEATURE 2.2).

## Fora de escopo
- README/INSTALL/CHANGELOG/package.json + `ksdd help` (task 059).
- Criar reference/commands (tasks 056, 057).

## Critérios de aceitação
- [ ] SPEC seção 11 descreve o health check (1x/sessão, não-bloqueante, silêncio, opt-out).
- [ ] SPEC 13.5 menciona a descoberta puxada pelo aviso.
- [ ] SPEC lista `KSDD_SKIP_UPDATE_CHECK` (seção 7.1) e nota "não é telemetria" (seção 12).
- [ ] architecture tem ADR-014 completa (agent-driven, CLI offline, sessão-only, sem `install*` nova).
- [ ] architecture seção 5 reconciliada (CLI sem rede / agente consulta registry); seção 4.2 lista a env var; roadmap atualizado.
- [ ] Edições cirúrgicas (`str_replace`) preservando o resto dos documentos.

## Notas técnicas
- Precedente direto: ADR-013 (`.ksdd/fixes/` como conteúdo, sem `install*`) — a ADR-014 é da mesma família ("conteúdo, não instalador"), mas o eixo é rede: reforçar que o gatilho ADR-012 (refator `installTarget` antes do 6º target) **permanece intocado** (esta feature não adiciona target nem função `install*`).
- Estes artefatos são read-only durante build de OUTRAS features — atualizá-los para documentar ESTA feature é trabalho legítimo desta task.

## Riscos / dependências externas
- A seção 5 do architecture tem uma afirmação forte ("nenhuma chamada de rede em runtime") — redigir a reconciliação com cuidado para não parecer que a CLI passou a fazer rede (ela não passou).
