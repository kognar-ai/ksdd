# Checagem de update do KSDD (procedimento canônico)

> Procedimento que o **agente** segue, uma vez por sessão de chat, na primeira invocação de qualquer
> slash command KSDD: compara a versão instalada com a última publicada no npm e avisa — sem bloquear —
> se houver versão nova.

**Quem executa:** o **agente** que está rodando o command (Claude Code, Codex, opencode, Antigravity, Copilot).
**Não** é a CLI `bin/ksdd.js` — o instalador permanece 100% offline (ADR-001/003). Toda a rede tocada aqui é
uma **leitura** do registry público do npm, feita pelo agente, a partir da máquina do usuário. Isto **não é
telemetria**: nada é enviado a servidores KSDD/Kognar (SPEC seção 12).

**Regra de ouro:** esta checagem **nunca** é caminho crítico. Em qualquer dúvida, erro, ausência de rede ou de
ferramenta — **pule em silêncio** e siga o command normalmente. É melhor não avisar do que atrapalhar.

---

## Quando rodar

Rode este procedimento **no início** de um command KSDD, **antes** do fluxo principal, **somente se todas** as
condições abaixo forem verdadeiras. Caso contrário, pule em silêncio (sem nenhuma mensagem):

1. Você **ainda não** executou esta checagem nesta conversa. Se já rodou (avisou ou pulou) numa invocação
   anterior desta mesma conversa, **não repita** — a checagem é **uma vez por sessão**, não uma vez por command.
   (Não há estado persistido: baseie-se no histórico da conversa atual.)
2. A variável de ambiente `KSDD_SKIP_UPDATE_CHECK` **não** está setada (ou está vazia). Se estiver setada com
   qualquer valor não-vazio, o usuário optou por desligar a checagem — pule.

---

## Passo 1 — Versão instalada

Leia o campo `version` do manifest de instalação:

- Arquivo: `~/.claude/skills/ksdd/.ksdd-manifest.json` (sempre gravado por `installClaude`, que roda em toda
  instalação — vale para todos os targets, inclusive Codex/opencode/Antigravity/Copilot).
- Faça o parse do JSON e pegue `.version` (ex.: `"0.11.0"`).

Fallback, se o manifest não existir ou não tiver `version`: `npm ls -g @kognar/ksdd --depth=0` e extraia a versão.

Se nenhum resolver uma versão → **pule em silêncio** (não há como comparar).

---

## Passo 2 — Versão publicada (última no npm)

Obtenha a última versão publicada. Use um timeout curto (~3s) e **não** insista:

1. **Primário (universal — qualquer agente com shell):**
   ```
   npm view @kognar/ksdd version
   ```
   Retorna a última versão (ex.: `0.12.0`).
2. **Fallback (se `npm` não está no PATH ou o comando falhou):** faça um `web_fetch`/GET de
   `https://registry.npmjs.org/@kognar/ksdd/latest` e leia o campo `.version` do JSON.

Se ambos falharem, derem timeout, ou o ambiente estiver offline → **pule em silêncio**. Não mostre o erro ao
usuário; não trave o command.

---

## Passo 3 — Comparar (semver)

Compare **instalada** vs **publicada** por semver:

- Considere apenas o núcleo numérico `MAJOR.MINOR.PATCH`. Descarte qualquer sufixo de pré-release/metadata
  (`-rc.1`, `+build`) antes de comparar.
- Compare `MAJOR`, depois `MINOR`, depois `PATCH` (numérico, não lexicográfico: `0.10.0` > `0.9.0`).
- **Avise apenas se `publicada` > `instalada`.**
- Se forem iguais, ou se `instalada` > `publicada` (build local à frente) → **silêncio total** (nenhuma mensagem).

---

## Passo 4 — Avisar e seguir

Se — e somente se — `publicada` > `instalada`, emita **uma** mensagem discreta e **prossiga imediatamente** com
o fluxo do command. O aviso é **informativo**, nunca um approval gate: não peça confirmação para continuar.

Mensagem canônica (substitua `{latest}` e `{current}`):

```
KSDD: versão v{latest} disponível (instalada: v{current}).
Atualize com: npm install -g @kognar/ksdd@latest
```

- Sem emoji, sem exclamação, uma linha de aviso + uma de comando (tom do SPEC seção 3).
- Idioma: redija o texto ("versão … disponível", "Atualize com") no **idioma da conversa**
  (`references/language-policy.md`); mantenha a linha de comando `npm install -g @kognar/ksdd@latest` verbatim.
- Logo depois, siga com o command normalmente (ex.: comece o brainstorm do `/ksdd:start`).

---

## Princípios

- **Não-bloqueante.** O command roda idêntico ao comportamento pré-feature em qualquer cenário de falha. A
  checagem jamais impede, atrasa criticamente ou condiciona o trabalho do command.
- **Silêncio é o default.** Só existe saída no caso "há versão nova". Atualizado, offline, erro, opt-out, ou
  2ª invocação da conversa → nenhuma mensagem.
- **Uma vez por sessão.** No máximo um aviso (ou uma tentativa) por conversa.
- **Leitura, não telemetria.** Só se lê a versão pública do registry; nada é reportado a lugar nenhum.
- **A CLI continua offline.** Nunca mova esta lógica para `bin/ksdd.js` — quem checa é o agente (ADR-001/003).

---

## Anti-patterns

- ❌ Transformar o aviso num gate ("Deseja atualizar antes de continuar? (s/n)"). → É informativo; siga direto.
- ❌ Mostrar erro de rede/npm ao usuário quando a checagem falha. → Falha = silêncio.
- ❌ Rechecar a cada command da mesma conversa. → Uma vez por sessão.
- ❌ Avisar quando já está atualizado ("Você está na última versão!"). → Silêncio quando não há update.
- ❌ Rodar a checagem via `bin/ksdd.js` / adicionar rede à CLI. → A CLI é offline por design; o agente checa.
- ❌ Auto-executar `npm install -g @kognar/ksdd@latest`. → Só sugere o comando; a atualização é do usuário.
