---
id: 033
title: Atualizar README/INSTALL/CHANGELOG + bump 0.9.0 no package.json
status: para implementar
feature: figma-integration
area: backend
priority: P1
estimate: S
depends_on: [028, 029, 030, 031, 032]
feature_refs:
  - ".ksdd/features/FEATURE-figma-integration.md#2-escopo"
  - ".ksdd/features/FEATURE-figma-integration.md#9-dependências-e-riscos"
  - ".ksdd/features/FEATURE-figma-integration.md#10-critérios-de-aceite"
spec_refs:
  - ".ksdd/specs/SPEC.md#7-estrutura-de-páginas-e-telas"
arch_refs:
  - ".ksdd/specs/architecture.md#2-stack-tecnológica"
---

# 033 — Atualizar README/INSTALL/CHANGELOG + bump 0.9.0

## Objetivo
Publicar a feature `figma-integration` para os usuários do KSDD: documentação no README, instruções no INSTALL, entrada no CHANGELOG, e bump de versão para `0.9.0` no `package.json`.

## Escopo
- **README.md** (raiz do repo KSDD):
  - Adicionar seção "Integração Figma" com:
    - Visão geral (1-2 frases).
    - Pré-requisitos: MCP oficial Figma instalado e autenticado no agente — link para a docs do Figma MCP.
    - Uso: `/ksdd:figma:export` (Claude), `/prompts:ksdd-figma-export` (Codex), `/ksdd-figma-export` (opencode).
    - Cobertura (4 categorias de tokens) e limitações conhecidas (sem components, sem modes, sem deletar órfãos em v1).
    - Link para a fixture `references/fixtures/example-DESIGN.md` como exemplo público.
  - Atualizar a lista de slash commands em outras seções (se enumeradas) para incluir o novo.
- **INSTALL.md**: adicionar passo opcional "Integração Figma" descrevendo como instalar o MCP do Figma (link para docs upstream) — não automatizamos isso.
- **CHANGELOG.md**: adicionar entrada `## 0.9.0 — 27/05/2026` com:
  - **Added:** `/ksdd:figma:export` + `references/figma-mapping.md` + `references/fixtures/example-DESIGN.md` + Gate 8 + ADR-011.
  - **Notes:** dependência do MCP oficial Figma; cobertura limitada a colors/typography/spacing/rounded; órfãos não são deletados.
- **package.json**: bump `"version": "0.8.0"` → `"version": "0.9.0"`.
- Verificar se o número de versão também aparece em outros lugares (manifest example no SPEC §4.1 hoje mostra `"0.8.0"` — atualizar consistência se necessário).

## Fora de escopo
- Publicar no npm (`npm publish`) — responsabilidade do mantenedor após merge da PR.
- Refator de instalador ADR-010 (não é v0.9.0, é da próxima feature multi-agent).
- Documentação interna em `.ksdd/specs/` (cobertas por T-032).

## Critérios de aceitação
- [ ] README.md tem seção "Integração Figma" com os 5 pontos descritos no escopo.
- [ ] INSTALL.md descreve o pré-requisito MCP do Figma sem prometer setup automático.
- [ ] CHANGELOG.md tem entrada `0.9.0` com Added e Notes.
- [ ] `package.json` na versão `0.9.0`.
- [ ] Referências de versão consistentes em SPEC §4.1 (se mencionarem versão exemplo).
- [ ] README/INSTALL não inventam comandos que não existem (não criar `ksdd figma` no CLI — o CLI não muda).
- [ ] Sem mudanças em `bin/ksdd.js`.

## Notas técnicas
- Versionamento segue convenção semver do projeto: feature não-breaking → minor bump (0.8.0 → 0.9.0).
- Padrão do CHANGELOG (ver versões anteriores) é Keep a Changelog ou similar — seguir o que estiver lá.
- README seção "Integração Figma" deve ficar próxima da seção que descreve `/ksdd:design` (fluxo natural: depois de gerar DESIGN.md, exportar para Figma).

## Riscos / dependências externas
- Esta task fecha a PR — todas as outras devem estar revisadas e prontas para merge.
- Se T-034 (QA dogfood) revelar bug crítico, esta task espera a correção antes do bump.
