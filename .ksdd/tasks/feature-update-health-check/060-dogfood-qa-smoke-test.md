---
id: 060
title: Dogfood + QA smoke test — dispara 1x/sessão, silêncio offline, opt-out, distribuição aos 5 targets
status: em revisão
feature: update-health-check
area: qa
priority: P1
depends_on: [056, 057, 058, 059]
estimate: M
feature_refs:
  - ".ksdd/features/FEATURE-update-health-check.md#4-fluxos-de-uso"
  - ".ksdd/features/FEATURE-update-health-check.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#11-interações-e-comportamentos"
arch_refs:
  - ".ksdd/specs/architecture.md#9-estratégia-de-testes"
---

# 060 — Dogfood + QA smoke test

## Objetivo
Validar a feature ponta-a-ponta antes do release: o comportamento do agente (aviso 1x/sessão, silêncio nos casos certos) e a distribuição do novo reference aos 5 targets, garantindo zero regressão em ambiente offline.

## Escopo — cenários de comportamento (dogfood, rodando um command real)
- **C1 — update disponível:** com versão instalada < remota (simular editando o `version` do manifest de teste), 1ª invocação de um command emite **exatamente uma** linha de aviso + comando de update, e o command **prossegue**.
- **C2 — 2ª invocação na mesma conversa:** nenhum aviso reemitido.
- **C3 — já atualizado:** instalada == remota → silêncio.
- **C4 — offline / npm ausente:** sem rede (ou PATH sem npm) → checagem pula em silêncio, command roda idêntico ao pré-feature.
- **C5 — opt-out:** `KSDD_SKIP_UPDATE_CHECK=1` → nenhuma checagem.
- **C6 — manifest ausente/ilegível:** pula em silêncio.
- **C7 — cobertura dos 11 commands:** confirmar que qualquer command (não só `start`) dispara o pré-flight na 1ª vez.

## Escopo — distribuição (smoke com HOME override, sem tocar o `~` real)
- `node -c bin/ksdd.js` (syntax check após a linha do `help`).
- Instalar com override por target e confirmar que `references/update-check.md` foi copiado:
  - `COPILOT_HOME=/tmp/t node bin/ksdd.js install --copilot --quiet` → checar `<...>/ksdd/references/update-check.md`.
  - Análogos para `--codex` (`CODEX_HOME`), `--opencode` (`OPENCODE_HOME`), `--antigravity` (`ANTIGRAVITY_HOME`) e Claude default (HOME de teste).
- `ksdd status` mostra a versão nova (0.12.0) e as contagens de arquivos por target aumentam em 1 (o novo reference).
- `ksdd uninstall --quiet` remove o reference rastreado e preserva arquivos não-ksdd (prune só de subdirs KSDD).

## Fora de escopo
- Implementar qualquer correção grande encontrada — abrir task/fix separado se o QA revelar algo estrutural.

## Critérios de aceitação
- [ ] C1–C7 validados e registrados (ex.: `QA-REPORT.md` na pasta da feature, como nas features anteriores).
- [ ] `node -c bin/ksdd.js` passa.
- [ ] `update-check.md` presente no bundle dos 5 targets após install (via HOME override).
- [ ] `ksdd status` reporta 0.12.0; contagens +1; `uninstall` limpa o reference sem apagar arquivos não-ksdd.
- [ ] Nenhuma regressão: com a rede desligada, todos os commands rodam como antes da feature.

## Notas técnicas
- Não há framework de teste (architecture seção 9) — validação manual com override de HOME por target, exatamente como o CLAUDE.md orienta.
- Precedente: `QA-REPORT.md` das features `new-fix-command` (054) e `antigravity-integration` (034).
- C4/C6 são os mais importantes: o valor da feature depende de ela **nunca** virar caminho crítico.

## Riscos / dependências externas
- Simular "offline" no ambiente de QA pode exigir desabilitar rede ou apontar `npm view` para um registry inexistente — documentar o método usado no QA-REPORT.
