# Referência: Approval Gates (regras dos checkpoints)

O KSDD é construído sobre **checkpoints obrigatórios**. Não há atalho. Cada comando termina forçando uma decisão humana antes do próximo.

## Por que checkpoints

1. **Documento ruim na fonte = entulho cascateado.** Se `brainstorm.md` está confuso, `SPEC.md` herda a confusão. Se `SPEC.md` está vago, `DESIGN.md` adivinha. Cada fase precisa estar sólida antes da próxima.
2. **Custo de iteração cresce.** Refazer brainstorm = 5 minutos. Refazer DESIGN.md = 30 minutos. Refazer architecture.md depois de implementar = semanas.
3. **Aprovação ativa = compreensão real.** Forçar o humano a dizer "aprovado" garante que ele leu. Aprovação silenciosa é assentimento, não compreensão.

## Regras dos gates

### Gate 1 — Após `/ksdd:start`
**Pré-condição pra `/ksdd:spec`:** `brainstorm.md` existe + aprovação explícita do usuário na conversa.

**Como o command verifica:** Lê `brainstorm.md`. Se não viu "aprovado", "tá bom", "pode prosseguir", "ok" ou equivalente referente AO brainstorm na conversa recente, pergunta antes de continuar.

**O que NÃO conta como aprovação:**
- "ok" como reação a outra coisa
- "pode prosseguir" dito antes do brainstorm ser gerado
- Silêncio (usuário sumiu)

### Gate 2 — Após `/ksdd:spec`
**Pré-condição pra `/ksdd:tech` ou `/ksdd:design`:** `SPEC.md` existe + aprovação explícita.

**Caso especial:** Se `/ksdd:design` é chamado sem `/ksdd:tech` ter rodado, ok — `tech` é opcional. Mas SPEC precisa estar aprovado.

### Gate 3 — Após `/ksdd:tech` (se chamado)
**Pré-condição pra `/ksdd:design`:** Se `architecture.md` existe, deve estar aprovado também. Senão, ignora.

### Gate 4 — Após `/ksdd:design`
**Fim do fluxo padrão.** Não há próximo comando KSDD. O usuário leva os 4 arquivos pra implementação.

## Como fazer o checkpoint

Após gerar o arquivo, **sempre** termine com uma versão deste prompt:

```
[Nome].md gerado em [path]. Recomendo revisar especialmente:
- [Seção X] — [por quê]
- [Seção Y] — [por quê]

Aprovado para prosseguir para `/ksdd:[próximo]`?
Ou me diga o que ajustar.

Não vou rodar o próximo comando até você aprovar explicitamente.
```

## Anti-patterns

- ❌ Rodar comandos em sequência sem checkpoint. Mesmo que o usuário pareça com pressa.
- ❌ Assumir aprovação de mensagens ambíguas. "Show", "legal", "interessante" não são aprovação.
- ❌ Pular o gate em projeto pequeno. O hábito importa mais que o tamanho do projeto.
- ❌ Aprovação implícita via "passa pro próximo". Pergunte: "isso é aprovação do [arquivo atual]?"

## Quando o usuário insiste em pular

Se o usuário diz "pula essa parte, roda tudo direto" ou similar:

> Entendo a pressa, mas o KSDD é desenhado pra você revisar cada artefato antes do próximo. Posso rodar `/ksdd:spec` agora se você confirma que leu o `brainstorm.md` e tá ok com o conteúdo. Confirma?

Se confirma, prosseguir. Se não responde, esperar. **Nunca** rodar sem confirmação.

## Quando os arquivos já existem

Se o usuário começa o fluxo com arquivos prévios no diretório:

```
[detectou brainstorm.md, SPEC.md de uma sessão anterior]

Encontrei artefatos KSDD prévios:
- brainstorm.md (DD/MM)
- SPEC.md (DD/MM)

Você quer:
1. Continuar de onde parou (próximo seria /ksdd:design)
2. Iterar num arquivo específico (qual?)
3. Recomeçar do zero (/ksdd:start)
```

Espere a escolha.
