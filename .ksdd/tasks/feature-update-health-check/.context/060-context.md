# Context — Task 060: dogfood + QA smoke test

**Issue:** local-only · **Área:** qa · **P1 · M** · depende de 056, 057, 058, 059

## Task em uma página
Validar a feature ponta-a-ponta antes do release: comportamento (aviso 1x/sessão, silêncio nos casos certos) e distribuição do reference aos 5 targets, com zero regressão offline.

## Ambiente sondado
- `npm` 10.9.7 disponível; `npm view @kognar/ksdd version` → `0.11.0` (published real).
- Fetch de `registry.npmjs.org/@kognar/ksdd/latest` → `0.11.0` (fallback funciona).
- Local dev está em `0.12.0` (à frente do published) — cenário real de "instalada > remota → silêncio".

## Método
Sem framework de teste (architecture §9). Duas frentes:
1. **Mecanismo (shell real):** um harness que reproduz fielmente a decisão de `references/update-check.md` (opt-out → versão instalada → versão remota → semver → notify/silent) e roda os cenários variando o `version` do manifest, a env var e a conectividade. Usa `npm view` real.
2. **Distribuição (HOME override):** install dos 5 targets em `/tmp`, confirmando `update-check.md` no bundle; `status`; `uninstall` limpo.
3. **Inspeção:** C2 (1x/sessão) e C7 (11 commands) são comportamento do agente — validados por inspeção (bloco nos 11 já confirmado na task 057; "1x/sessão" é instrução explícita em update-check.md).

## Cenários
- C1 update disponível (manifest 0.10.0 < remoto) → NOTIFY
- C2 2ª invocação → sem novo aviso (inspeção)
- C3 já atualizado (manifest == remoto) → SILENT
- C4 offline / npm ausente → SKIP silencioso, command segue
- C5 opt-out KSDD_SKIP_UPDATE_CHECK=1 → SKIP antes de qualquer rede
- C6 manifest ausente/ilegível → SKIP
- C7 os 11 commands disparam (inspeção)

## Critérios (task 060)
- [ ] C1–C7 validados e registrados em QA-REPORT.md.
- [ ] `node -c bin/ksdd.js` passa.
- [ ] update-check.md presente no bundle dos 5 targets após install (HOME override).
- [ ] status reporta 0.12.0; contagens +1; uninstall limpa o reference sem apagar não-ksdd.
- [ ] Nenhuma regressão: sem rede, os commands rodam como antes.
