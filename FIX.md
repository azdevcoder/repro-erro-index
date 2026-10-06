# Fix aplicado no original (manuais-escritorio)

- store.js: normalizar()+sanitizar(), carregar() sanitiza LS/fetch/seed, status(null) -> vazio, export sanitizar.
- index.js: setoresUnicos/filtrar null-safe, titulo+setor via String(), descRaw normalizado (sem m.descricao.length cru), prontos null-safe, import usa Store.sanitizar + rejeita vazio.
- manual.js: leitura/editor usam (passos||[]), img com (p&&p.imagem), arr fallback, btnAdd garante array.
- Verificado: node --check OK (index/store/manual/theme sem output = pass), data 22 itens ok, Store.sanitizar([null,{id:x},{Nota/FISCAL}]) -> só Nota, status(null)=vazio.
