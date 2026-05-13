# Contribuindo para o KSDD

Obrigado por considerar contribuir com o **KSDD** (Kognar Spec-Driven Design & Development). Este documento resume como participar de forma alinhada ao projeto e à licença **GNU AGPL-3.0**.

## Licença e direitos

- Ao enviar código, documentação ou outros materiais para este repositório, você concorda que sua contribuição seja licenciada sob os mesmos termos do projeto: **GNU Affero General Public License v3.0** (AGPL-3.0) ou posterior, salvo acordo explícito em contrário com os mantenedores.
- Se sua contribuição incluir trechos de terceiros, indique a origem e a licença compatível com a AGPL-3.0.

## Como contribuir

1. **Issues** — Abra uma [issue no GitHub](https://github.com/kognar-tools/ksdd/issues) para bugs, ideias ou discussões antes de mudanças grandes.
2. **Fork e branch** — Faça fork do repositório, crie uma branch descritiva (ex.: `fix/approval-gate-copy`, `feat/command-xyz`).
3. **Mudanças** — Mantenha commits focados e mensagens claras em português ou inglês.
4. **Consistência** — Ao alterar comandos (`commands/`), referências (`references/`) ou agentes (`agents/`), preserve o fluxo de aprovação, os templates canônicos e o tom orientado a produto/design já usados no repositório.
5. **Pull Request** — Descreva o problema ou objetivo, o que mudou e como validar (ex.: instalar a skill e rodar um comando). Linke issues relacionadas quando houver.

## O que esperamos nas contribuições

- **Clareza** — Textos de comandos e referências devem continuar acionáveis para humanos e para o Claude Code.
- **Sem quebra de fluxo** — Novos comandos ou gates devem seguir o padrão de checkpoints e referências cruzadas (`approval-gates.md`, templates em `references/`).
- **Node** — O instalador em `bin/ksdd.js` deve permanecer compatível com a versão mínima de Node declarada no `package.json`.

## Código de conduta

Seja respeitoso e construtivo em issues e pull requests. Comentários ofensivos, assédio ou spam não serão tolerados.

## Dúvidas

Use as issues do repositório ou o canal indicado pelos mantenedores do projeto Kognar.
