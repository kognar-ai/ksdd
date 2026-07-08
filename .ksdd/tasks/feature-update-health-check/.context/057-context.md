# Context — Task 057: pré-flight de update-check nos 11 commands

**Issue:** local-only · **Área:** backend · **P0 · M** · depende de 056 (em revisão nesta branch)

## Task em uma página
Fazer cada slash command disparar a checagem de update na 1ª invocação KSDD da conversa. Como a "primeira vez" depende de qual command o usuário abre primeiro, os **11** precisam do gatilho. O bloco referencia `references/update-check.md` (task 056) — nenhuma lógica nova aqui.

## Feature spec relevante — 8.2 (colado)
> **Pré-flight (uma vez por sessão):** se você ainda não executou a checagem de update nesta conversa e `KSDD_SKIP_UPDATE_CHECK` não está setado, siga `references/update-check.md` antes de prosseguir. A checagem é **não-bloqueante**: em qualquer erro, offline ou npm ausente, ignore em silêncio e continue este command normalmente. Nunca repita a checagem se já a fez nesta conversa.

## Plano de implementação (arquivos)
Ponto de inserção uniforme: logo **antes** de `## Idioma (obrigatório)` (header presente e único nos 11). O bloco vira a 1ª seção `##` do corpo (após o parágrafo intro).

Bloco a inserir (idêntico nos 11):
```
## Pré-flight — checagem de update (uma vez por sessão)

Se você ainda **não** executou a checagem de update nesta conversa e `KSDD_SKIP_UPDATE_CHECK` não está setado, siga `references/update-check.md` **antes** de prosseguir. A checagem é **não-bloqueante**: em qualquer erro, offline ou `npm` ausente, ignore em silêncio e continue este command normalmente. Nunca repita a checagem se já a fez nesta conversa.
```

Ajustes de `allowed-tools` (adicionar a ferramenta da checagem — `Bash` p/ `npm view`):
- `start.md`  → `+ Bash, web_fetch` (só tinha web_search)
- `spec.md`   → `+ Bash` (já tinha web_fetch)
- `tech.md`   → `+ Bash`
- `design.md` → `+ Bash`
- `new:feature.md` → `+ Bash`
- Já OK (têm `Bash`): `archive`, `new:fix`, `setup`, `build:all`, `build:fix`, `build:feature`.

## Critérios (task 057)
- [ ] Os 11 commands têm o bloco, idêntico, referenciando `references/update-check.md`.
- [ ] Bloco antes do fluxo principal (é a 1ª seção após intro).
- [ ] `allowed-tools` de cada command permite a checagem; nenhum perde tools.
- [ ] Frontmatters continuam YAML válido.
- [ ] Diff só adiciona o bloco + ajuste de allowed-tools.

## Quality gates
- [ ] `grep` confirma o bloco nos 11 (contagem 11).
- [ ] `grep` confirma `Bash` no allowed-tools dos 11.
- [ ] Revisão de diff (só adições).
