# Context — Task 056: criar references/update-check.md

**Issue:** local-only (branch designada `claude/feature-health-check-updates-ek5kf1`) · **Área:** backend · **P0 · M** · sem dependências

## Task em uma página
Escrever o procedimento canônico único `references/update-check.md` que qualquer agente segue para checar se há versão nova do `@kognar/ksdd`. É o núcleo da feature — os 11 commands (task 057) só vão referenciá-lo. Sem esse arquivo a lógica ficaria duplicada em 11 lugares.

**Critérios (task 056):**
- Auto-contido (agente executa só com ele).
- Skips antecipados: já-checado-nesta-conversa + `KSDD_SKIP_UPDATE_CHECK`.
- Versão instalada: manifest `version` (+ fallback `npm ls -g`). Remota: `npm view` primário + `web_fetch` fallback. Skip silencioso em falha.
- Comparação semver; avisa só quando remota > instalada.
- Mensagem canônica (FEATURE 8.1).
- Não-bloqueante, sem confirmação, 1x/sessão, silêncio em erro/offline/atualizado.

## Feature spec relevante (FEATURE-update-health-check.md)

### 2.1 O que entra (v1) — mecanismo (colado)
- Fonte da versão instalada: campo `version` do `~/.claude/skills/ksdd/.ksdd-manifest.json`. Fallback: `npm ls -g @kognar/ksdd`.
- Fonte da versão remota: agente roda `npm view @kognar/ksdd version` (primário universal) e/ou `web_fetch` em `https://registry.npmjs.org/@kognar/ksdd/latest` (fallback).
- Escopo temporal: uma vez por sessão de chat, sem persistência (decisão olhando o histórico da conversa; sem gravar no manifest).
- Saída: avisa só se remota > instalada; sugere `npm install -g @kognar/ksdd@latest`; não auto-atualiza. Silêncio quando atualizado.
- Não-bloqueante e à prova de offline: qualquer erro → pula em silêncio e o command segue.
- Opt-out: `KSDD_SKIP_UPDATE_CHECK=1`.

### 8.1 Mensagem canônica (colado)
```
KSDD: versão v{latest} disponível (instalada: v{current}).
Atualize com: npm install -g @kognar/ksdd@latest
```
Discreta, sem emoji, sem exclamação; tom do SPEC seção 3.2. Segue o command sem exigir confirmação.

## SPEC relevante
- **4.1 Manifest:** `~/.claude/skills/ksdd/.ksdd-manifest.json` com campo `version` (ex.: `"0.11.0"`). Sempre presente (installClaude roda em toda instalação).
- **12 Modelo de negócio:** sem telemetria. A checagem lê o registry público — nada é enviado a servidores KSDD/Kognar. Deixar explícito no reference.

## Arquitetura relevante
- **Seção 5 / ADR-001/003:** "KSDD não faz nenhuma chamada de rede em runtime" — refere-se ao **CLI** `bin/ksdd.js`. A checagem é feita pelo **agente**, não pela CLI → princípio preservado. Cabeçalho do reference deve deixar isso explícito para ninguém mover a lógica para `bin/ksdd.js`.
- `references/` é distribuído aos 5 targets por `copyDir(references/...)` (bin/ksdd.js:168,205,235,283,367) — o novo arquivo entra sem linha de instalador nova (padrão ADR-013).

## Plano de implementação (arquivos)
- **Novo:** `references/update-check.md`. Estrutentura: cabeçalho (o que é, quem executa = agente, não a CLI) → "Quando rodar" (1x/sessão + skips) → passo 1 versão instalada → passo 2 versão remota → passo 3 comparar → passo 4 avisar/seguir → princípios (não-bloqueante/silêncio) → anti-patterns.
- Estilo: pt-BR, `**labels:**`, sem emoji, espelha `references/fix-template.md` / demais references.
- Nenhum outro arquivo nesta task (wiring nos commands = task 057).

## Quality gates (aplicáveis a um reference Markdown)
- [ ] Sem framework de teste no repo (architecture §9) e sem JS tocado → `node -c` não se aplica.
- [ ] Revisão contra os 6 critérios da task 056.
- [ ] Consistência de estilo/idioma com os demais `references/*.md`.
- [ ] Auto-suficiência: reler como se fosse o agente e confirmar que dá pra executar sem ambiguidade (foco em "não-bloqueante" para não virar gate).
