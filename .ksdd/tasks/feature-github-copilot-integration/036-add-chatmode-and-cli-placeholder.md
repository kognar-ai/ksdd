---
id: 036
title: Adicionar chat mode global + placeholder Copilot CLI ao installCopilot()
status: para implementar
feature: github-copilot-integration
area: backend
priority: P1
estimate: S
depends_on: [035, 039]
feature_refs:
  - ".ksdd/features/FEATURE-github-copilot-integration.md#21-o-que-entra-v1"
  - ".ksdd/features/FEATURE-github-copilot-integration.md#5-impacto-em-telas-existentes"
spec_refs:
  - ".ksdd/specs/SPEC.md#71-cli-binksddjs"
arch_refs:
  - ".ksdd/specs/architecture.md#4-apis-e-endpoints"
---

# 036 — Chat mode global + placeholder Copilot CLI

## Objetivo
Estender `installCopilot()` com duas superfícies adicionais globais: a **chat mode** `ksdd.chatmode.md` (contexto canônico) e o **placeholder do Copilot CLI** (`~/.copilot/prompts/`), pronto pra quando o CLI passar a consumir comandos custom.

## Escopo
- **Chat mode:** gerar `<userDir>/prompts/ksdd.chatmode.md` a partir de `references/copilot-AGENTS.md` (task 039), adicionando/preservando o frontmatter de chat mode. Adicionar o path ao `tracked`.
- **Placeholder Copilot CLI:**
  - `ensureDir(path.join(os.homedir(), '.copilot', 'prompts'))`
  - Copiar os 9 `ksdd-*.prompt.md` para `~/.copilot/prompts/` (mesma nomenclatura da task 035).
  - Adicionar cada path ao `tracked`.
  - Não falhar se `~/.copilot/` não existir — cria (idempotente).
- Ambas as superfícies rodam dentro de `installCopilot()` (mesma invocação `--copilot`), depois do núcleo da task 035.
- Contagem de arquivos na saída reflete as superfícies instaladas.

## Fora de escopo
- Núcleo prompt files user-profile + bundle (task 035).
- Modo `--project` (task 037).
- Manifest/uninstall/status (task 038) — o array `tracked` genérico já cobre estes paths.
- Ativação real do Copilot CLI (upstream não suporta — FEATURE seção 2.2).

## Critérios de aceitação
- [ ] Após `ksdd install --copilot`: existe `<userDir>/prompts/ksdd.chatmode.md` com frontmatter de chat mode válido.
- [ ] Após `ksdd install --copilot`: existem 9 `ksdd-*.prompt.md` em `~/.copilot/prompts/`.
- [ ] Todos os novos paths (chat mode + CLI) são adicionados ao `tracked` e aparecem no manifest (via task 038).
- [ ] Idempotência preservada: re-rodar não duplica nem erra.
- [ ] Se `~/.copilot/` não existe, é criado sem warning fatal.
- [ ] Falha graciosa em postinstall (warning amarelo, exit 0).

## Notas técnicas
- A chat mode é derivada do mesmo `references/copilot-AGENTS.md` usado pelo `AGENTS.md` do bundle — se o arquivo-fonte já tem frontmatter de chat mode, é `copyFile` direto para `ksdd.chatmode.md`; senão, prepender o frontmatter mínimo. Decidir com base no que a task 039 entregou.
- O placeholder CLI é intencionalmente inócuo hoje (copilot-cli#618/#1113). Documentar no help (task 042) como "pronto pra quando o CLI suportar".
- Manter o código dentro de `installCopilot()` — não criar função separada; é continuação do loop de cópia.

## Riscos / dependências externas
- Se o placeholder CLI confundir usuários (arquivos que o CLI ignora), pode ser removido da v1 sem afetar o núcleo — é P1 isolável.
- Formato de chat mode do Copilot pode evoluir — confirmar no dogfood (task 043).
