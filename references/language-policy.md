# Política de idioma (KSDD)

Os commands e agentes KSDD neste repositório podem estar redigidos em português por convenção de manutenção. **Isso não fixa o idioma das perguntas ao usuário nem dos artefatos gerados.**

## Prioridade — idioma dos artefatos

Ao gerar ou editar qualquer artefato (`brainstorm.md`, `SPEC.md`, `architecture.md`, `DESIGN.md`, `FEATURE-*.md`, tasks, `context.md`, `BUILD-PLAN.md`, commits/PRs descritos pelo fluxo):

1. **Idioma explícito em `$ARGUMENTS`** — ex.: `generate in English`, `gera em inglês`, `--lang en`
2. **Idioma declarado em artefatos existentes** — campo `**Idioma da interface:**` no brainstorm/SPEC ou equivalente
3. **Idioma da conversa atual** — idioma predominante nas mensagens do usuário nesta thread (prompt, respostas, texto do slash command)
4. **Se ainda ambíguo** — uma pergunta curta de confirmação, redigida no idioma que o usuário já está usando na conversa

**Nunca** assuma pt-BR (ou qualquer locale) só porque o command está em português.

## Perguntas ao usuário (interviewer)

- Faça perguntas e opções de `ask_user_input_v0` no **mesmo idioma** que o usuário usa na conversa.
- Se o usuário escreve em inglês, não force português nas perguntas nem nas opções.
- A pergunta sobre idioma da interface (quando necessária) deve listar opções neutras (ex.: `en-US`, `pt-BR`, `both`, `other`) — sem tratar pt-BR como default implícito.

## Consolidação (consolidator)

- Redija o artefato inteiro no idioma resolvido pela prioridade acima.
- Preserve termos de domínio no idioma que o usuário definiu (não traduza nomes de produto, features ou glossário sem pedido).
- Mensagens de checkpoint e aprovação ao usuário: **mesmo idioma da conversa**.

## Projetos bilíngues

Se o produto exige mais de um idioma de UI:

- Documente em `**Idioma da interface:**` no brainstorm/SPEC.
- Prefira artefatos separados (ex.: `.ksdd/specs/SPEC-en.md`, `.ksdd/specs/SPEC-pt.md`) em vez de misturar idiomas no mesmo arquivo, salvo pedido explícito.

## Anti-patterns

- ❌ Gerar SPEC em português porque o command `/ksdd:spec` está em português.
- ❌ Perguntar "Qual o idioma?" em português quando o usuário só falou inglês na thread.
- ❌ Misturar parágrafos em PT e EN no mesmo artefato sem solicitação.
- ❌ Ignorar `$ARGUMENTS` que pedem um idioma específico.
