# Context — Task 033: docs do pacote + bump 0.9.0

**Issue:** #22 · **Área:** design · **P0 · M** · depende de #17/#18/#19

## Task em uma página
Refletir o 4º target na doc distribuída e bumpar a versão para 0.9.0 (minor — nova capacidade backwards-compatible).

## Arquivos modificados
- `README.md` (intro, seção de targets/tabela, instalação, env vars)
- `INSTALL.md` (tabela de agentes, instalação seletiva, troubleshooting, nota de prune ~/.gemini)
- `CHANGELOG.md` (entrada [0.9.0] - 2026-06-01)
- `package.json` (version 0.9.0, description, keywords antigravity)

## Quality gates (validados)
- [x] README lista 4 agentes + --antigravity/KSDD_WITH_ANTIGRAVITY/ANTIGRAVITY_HOME
- [x] INSTALL documenta paths CLI+IDE+bundle e o prune restrito
- [x] CHANGELOG [0.9.0] com data, exemplos, ADR-011, nota [verificar] do path IDE
- [x] package.json valid JSON, version 0.9.0
- [x] `ksdd status` mostra `KSDD v0.9.0` (versão flui do package.json para o manifest)
