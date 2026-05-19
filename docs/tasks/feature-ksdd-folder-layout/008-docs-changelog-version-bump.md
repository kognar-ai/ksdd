---
id: 008
title: Atualizar README/INSTALL/CHANGELOG e bumpar versão para 0.6.0
status: para implementar
feature: ksdd-folder-layout
area: backend
priority: P0
estimate: S
depends_on: [001, 002, 003, 004, 005, 006, 007]
feature_refs:
  - "docs/FEATURE-ksdd-folder-layout.md#2-escopo"
  - "docs/FEATURE-ksdd-folder-layout.md#10-criterios-de-aceite"
spec_refs:
  - "SPEC.md#136-atualizacao-da-propria-instalacao"
arch_refs:
  - "architecture.md#10-decisoes-arquiteturais-significativas-adrs"
---

# 008 — Atualizar docs públicas + bump de versão

## Objetivo
Documentar publicamente o novo layout `.ksdd/` (README, INSTALL, CHANGELOG) e bumpar a versão do pacote para `0.6.0`, sinalizando a mudança e a estratégia de compat retroativa.

## Escopo
- `README.md`:
  - Nova seção "Layout dos artefatos" mostrando árvore `.ksdd/` completa.
  - Atualizar todos os exemplos de path nos snippets de uso.
  - Nota de migração no início de "Como usar" mencionando v0.6.0 + leitura backward-compatible.
- `INSTALL.md`:
  - Atualizar "o que esperar" pós-instalação com paths novos.
  - Manter exemplos de install/uninstall/status sem mudança (não afetado).
- `CHANGELOG.md`:
  - Adicionar `## [0.6.0] - 2026-XX-XX` no topo com:
    - Novo layout `.ksdd/{specs,features,tasks,build}/`.
    - Compat retroativa de leitura (artefatos raiz/docs continuam funcionando).
    - Recomendação de migração manual via `git mv`.
    - Lista de breaking changes futuros (remoção do fallback) planejados para `1.0.0`.
- `package.json`:
  - Bump `version` de `0.5.1` (ou atual) para `0.6.0`.

## Fora de escopo
- Publicar no npm (mantenedor faz manualmente após review do PR — SPEC seção 13.5).
- Tag git automática.

## Critérios de aceitação
- [ ] README tem seção dedicada "Layout dos artefatos" com diagrama de árvore `.ksdd/`.
- [ ] README cita "compat retroativa: artefatos legados continuam sendo lidos com warning".
- [ ] INSTALL.md sem inconsistências de path.
- [ ] CHANGELOG `## [0.6.0]` no topo com 4 sub-bullets: layout / compat / migração / futuro 1.0.
- [ ] `package.json` `version` = `0.6.0`.
- [ ] Grep `grep -n "^\* SPEC\.md\|^\* brainstorm\.md" README.md INSTALL.md` não retorna paths legados como default.
- [ ] `npm install` local sem erros (sintaxe do package.json válida).

## Notas técnicas
- Manter tom pt-BR técnico (SPEC 3.5). CHANGELOG aceita PT ou EN (brainstorm seção 9).
- Não bumpar para `1.0.0` ainda — esta é layout migration com compat, não breaking change definitivo.

## Riscos / dependências externas
- Bloqueada por 001-007: a documentação só faz sentido quando o código está alinhado.
- Coordenar data do `[0.6.0]` no CHANGELOG com a data real do merge final.
