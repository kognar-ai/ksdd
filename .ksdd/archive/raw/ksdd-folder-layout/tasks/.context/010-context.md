# Context — Task 010: QA end-to-end

## Limitação importante
Os commands KSDD são prompts em Markdown lidos por Claude/Codex; eles não executam código diretamente nesta sessão. QA "real" (Cenários A/B/C com `/ksdd:start`, `/ksdd:new:feature`, etc.) requer:
1. `npm install -g .` (instalar v0.6.0 local)
2. Criar diretórios tmp para greenfield e legado
3. Invocar slash commands de dentro do Claude Code com o cwd apontando para cada tmp

Como esta sessão de build não tem como rodar `/ksdd:start` em outra cwd interativamente, executo a **QA estrutural** possível agora e documento o que fica pendente para QA interativa:

## QA estrutural executável (substitui Cenários A/B/C parcialmente)
- ✓ Grep no repo por paths legados como default → só em fallback/legado (validado por task)
- ✓ Cada command tem bloco "Paths dos artefatos (v0.6.0+)" com regras de fallback, conflito, escrita
- ✓ Templates em references/ atualizados
- ✓ Agents atualizados
- ✓ README/INSTALL/CHANGELOG sincronizados
- ✓ package.json bumped para 0.6.0
- ✓ Dogfooding aplicado: próprio repo migrado, raiz limpa

## QA interativa pendente (post-merge)
Critérios da FEATURE seção 10 que dependem de invocação real de commands:
- Em projeto vazio, /ksdd:start cria .ksdd/specs/brainstorm.md
- Em projeto com SPEC.md raiz, /ksdd:new:feature emite warning amarelo
- /ksdd:setup em projeto com legado pergunta 3 opções
- etc.

Esses precisam ser rodados pelo mantenedor numa sessão Claude Code real após `npm install -g .`.

## Validação adicional executável agora
- Verificar consistência cruzada: paths default citados em todos os artefatos batem entre si.
- Verificar que o próprio repo passa nos critérios de aceite após dogfooding.
