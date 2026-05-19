<!--
Salvar em: .ksdd/specs/SPEC.md (default v0.6.0+; fallback raiz SPEC.md legado)
-->

# SPEC.md — [Nome do Projeto]

> [Tagline curta — o que é o produto]

**Versão:** 1.0
**Última atualização:** [DD/MM/AAAA]
**Plataforma alvo (MVP):** [Web responsivo / Mobile / Desktop / Multi-plataforma]
**Idioma da interface:** [locale do produto — ex.: en-US, pt-BR, both]

---

## 1. Visão do Produto

### 1.1 Problema
[Referência ao brainstorm seção 2, mas expandido com mais profundidade. Inclui dados/observações se houver.]

### 1.2 Solução
[Expandido do brainstorm seção 3. Foco no como.]

### 1.3 Público-Alvo
[Resumo de quem é o público. Personas detalhadas vêm na seção 2.]

### 1.4 Referência Principal
[Produto-âncora que define a categoria + adaptações específicas.]

---

## 2. Personas

### 2.1 [Nome — Papel]
- [Idade], [ocupação], [contexto relevante]
- [Como interage com o produto hoje, sem ele]
- [Frustração principal]
- [O que espera resolver com o produto]
- [Características de uso: frequência, tipo de dispositivo, momento do dia]

### 2.2 [Nome — Papel]
[mesmo formato]

### 2.3 [Nome — Papel] (opcional)
[mesmo formato]

---

## 3. Identidade Visual e Direção de Design

### 3.1 Personalidade da Marca
[Como o produto se sente. Adjetivos qualificados com contexto.]

### 3.2 Paleta de Cores (direção)
[Tom geral — escuro/claro, vibrante/sóbrio, monocromático/colorido. Cores específicas vêm em DESIGN.md.]

### 3.3 Tipografia (direção)
[Estilo geral — sans-serif limpa, serif editorial, mistura, monospace pra dados. Fontes específicas em DESIGN.md.]

### 3.4 Iconografia
[Estilo dos ícones, motivos visuais, ornamentação.]

### 3.5 Tom Geral
[Como a interface "fala" — formal, descontraído, técnico, caloroso.]

---

## 4. Modelo de Dados

[Entidades centrais e atributos críticos. Não precisa de tipos detalhados ainda — isso é architecture.md.]

### 4.1 [Entidade Principal]
[Descrição + atributos críticos]

### 4.2 [Entidade Secundária]
[mesmo formato]

### 4.3 Relações
[Como as entidades se conectam. Diagrama em texto se ajudar.]

---

## 5. Fontes de Dados (se aplicável)

[De onde vêm os dados do produto. Pode incluir:
- Submissões de usuários
- APIs externas
- Scraping/extração automatizada
- Parceiros
- Geração pelo próprio sistema]

---

## 6. Perfis de Usuário e Permissões

| Perfil | Pode | Não pode |
|--------|------|----------|
| Visitante (não logado) | [...] | [...] |
| Usuário gratuito | [...] | [...] |
| Usuário premium | [...] | [...] |
| Admin | [...] | [...] |

---

## 7. Estrutura de Páginas e Telas

### 7.1 Navegação Global
[Estrutura da nav bar, footer, navegação mobile.]

### 7.2 [Nome da Tela 1]
**Objetivo:** [uma frase]

**Seções (de cima pra baixo):**
- A. [Seção] — [conteúdo]
- B. [Seção] — [conteúdo]
- ...

**Componentes usados:** [referência à seção 8]

**Comportamento mobile:** [adaptações específicas]

### 7.3 [Nome da Tela 2]
[mesmo formato]

[... uma subseção por tela principal ...]

---

## 8. Componentes Globais Reutilizáveis

| Componente | Onde aparece | Variantes |
|------------|--------------|-----------|
| [Nome] | [Telas X, Y, Z] | [estados, tipos] |

[Para cada componente, descreva estrutura e variantes. Tokens visuais (cores, fontes) vêm em DESIGN.md.]

---

## 9. Touchpoints Críticos

[Onde CTAs específicas aparecem ao longo da plataforma — útil pra fluxos transversais como "criar conta", "fazer upgrade", "reivindicar perfil".]

---

## 10. Responsividade

| Breakpoint | Comportamento |
|------------|---------------|
| Desktop (1280px+) | [...] |
| Tablet (768-1279px) | [...] |
| Mobile (<768px) | [...] |

---

## 11. Interações e Comportamentos

[Interações que se repetem ou são críticas:
- Autocomplete
- Hover states
- Transições
- Scroll behavior
- Pull-to-refresh
- Skeleton loading
- Empty states
- Error states]

---

## 12. Modelo de Negócio (Impacto na Interface)

### 12.1 Planos
| Plano | Preço | Limites/Features |
|-------|-------|------------------|
| [...] | [...] | [...] |

### 12.2 Onde o Paywall Aparece
[Pontos da UI onde o usuário gratuito esbarra em features premium.]

---

## 13. Fluxos Críticos (User Journeys)

### 13.1 [Nome do Fluxo]
[Sequência passo a passo, do entry point até o sucesso. Inclui telas tocadas e decisões.]

### 13.2 [Nome do Fluxo]
[mesmo formato]

[Top 3-5 fluxos.]

---

## 14. Fases de Entrega

### Fase 1 — MVP
[Lista do que entra. Conjunto mínimo testável.]

### Fase 2 — [Bloco temático]
[Próximo conjunto coerente de features.]

### Fase 3 — [Bloco temático]
[Visão de médio prazo.]

---

## 15. Métricas de Sucesso

| Métrica | Meta (3-6 meses) |
|---------|-------------------|
| [KPI] | [número alvo] |

---

**Próximos passos:**
- `/ksdd:tech` — gerar arquitetura técnica (stack, banco, integrações)
- `/ksdd:design` — gerar design system completo (DESIGN.md no formato Google Stitch)
