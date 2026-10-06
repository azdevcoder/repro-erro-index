# Repro erro JS index.html — análise

Reproduz `TypeError: Cannot read properties of null/undefined` do `manuais-escritorio/js/index.js` e `js/manual.js`.

Rodar: `node repro.js` (v1) e `node repro2.js` (v2 fiel). Abrir `index.html` no navegador p/ ver o throw no console.

## Trilha crítica
1. `Store.carregar()` retorna lista (fetch `data/manuais.json`, fallback `MANUAIS_SEED`, ou `localStorage`, ou **import JSON sem validar itens** — `index.js:88-92` aceita qualquer array).
2. `index.js:init()` → `render()` → `filtrar()` (`index.js:11-27`) e `setoresUnicos()` (`:5-9`).
3. `filtrar` linha 24: `(m.titulo + " " + m.setor).toLowerCase()` — THROW se item `null` (caso D).
4. `render` linha 43/47: `(m.descricao||"").slice` ok, mas `m.descricao.length` latente (caso A/B).
5. `Store.status(m)` (`store.js:39-44`) é seguro p/ campos ausentes (`(m.passos||[])`), mas THROW se `m` é `null` (`m.passos` em null).
6. `manual.js:25` `!manual.passos.length` — THROW se `passos` undefined (caso C, ex.: manual importado sem campo).

## Sintomas do erro
- Tela branca / lista vazia, console: `Uncaught TypeError: Cannot read properties of null (reading 'titulo')` ou `... undefined (reading 'length')`.
- Só aparece após Importar backup / localStorage sujo; com seed original (21× `descricao:""`, `passos:[]`) não aparece — por isso parecia intermitente.

## Entenda realmente o que está acontecendo
- Seed atual mascara o bug: `descricao:""` é falsy → `desc=""` falsy → ternary da linha 47 **não avalia** `m.descricao.length` (short-circuit). Prova: caso A `buggy=OK`.
- Ou seja, `index.js:47` é **dívida latente**, não causa ativa p/ `undefined`. Vira THROW real com item `null` (caso B) ou `descricao` não-string truthy.
- Causas ativas reais: **itens null** via import + **`manual.passos` undefined** + **`Store.status(null)`**.

## Bugs (comportamento errado agora)
- B1 `manual.js:25,29,57`: `manual.passos.length/forEach` sem fallback → quebra manual sem campo `passos`.
- B2 `index.js:16,24`: `filtrar` assume `m` objeto com `titulo/setor` → quebra com item `null`.
- B3 `index.js:88-92`: import aceita `dados` sem validar itens (`null`, sem `id/titulo`) e recarrega — persiste o veneno no LS.
- B4 `store.js:39`: `status(null)` quebra (`m.passos` em null) — chamado por `filtrar` e `render`.

## Debt (código que cobra juros)
- D1 `index.js:43` usa guard `(m.descricao||"")` mas `:47` reusa campo cru `m.descricao.length` — dois padrões p/ mesmo campo.
- D2 `store.js` é defensivo (`(m.passos||[])`, `(m.descricao||"")`) mas chamadores não — contrato implícito.
- D3 `esc()` é null-safe, mas só usado em alguns campos; resto concatena cru.

## Gap (o que falta)
- G1 Normalizar na borda: `carregar()` + import deveriam sanitizar cada item (`{id,titulo,setor,prioridade,descricao,passos}` com defaults).
- G2 Contrato explícito: item nunca `null`; `passos` sempre array; `descricao` sempre string.

## In order (ordem de ataque)
1. Reproduzir (este repo, casos B/C/D) — feito.
2. Sanitizar borda (`store.carregar` + import valida/filtra null + defaults).
3. Tornar render/manual null-safe (`String(...)/||[]`).
4. Unificar padrão (sempre `desc` já normalizado, nunca `m.descricao.length` cru).

## Problema real
Falta de validação na borda (import/LS) + guards inconsistentes. Seed limpo escondia; dado real (backup editado) expõe. Fix no sintoma (só `?.` num ponto) não resolve — tem que fechar a borda.

## Pagamento (o que pagar agora)
- `repro2.js:fixed` mostra o padrão: `if(!m) return`, `String(x??"")`, `(arr||[])`.
- Aplicar no original:
  - `index.js`: `filtrar`/`setoresUnicos`/`render` com guards + import valida itens.
  - `manual.js`: `(manual.passos||[])` em leitura/editor/add.
  - `store.js`: `status(null)` retorna `vazio`; `carregar` sanitiza.
- Verificar: `node --check` + importar JSON sujo `[null,{"id":"x"}]` e confirmar sem throw.

## Commits
- `e2d4268` repro v1 (buggy + 2/3 throws, caso A falso-negativo documentado)
- este commit: repro2 fiel + análise (casos A=OK-latente, B/C/D=THROW, fixed=OK)
