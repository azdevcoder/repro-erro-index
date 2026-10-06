// Repro Node do erro js/index.js:47 e js/manual.js:25
// Roda com: node repro.js  -> deve lançar TypeError e imprimir trilha crítica
function renderBuggy(m) {
  var desc = (m.descricao || "").slice(0, 90); // seguro
  // abaixo é a linha 47 original — INSEGURO:
  return (desc ? '<div>' + desc + (m.descricao.length > 90 ? "…" : "") + "</div>" : "");
}
function statusSeguro(m) {
  var n = (m.passos || []).filter(function (p) { return (p.titulo || "").trim(); }).length;
  return n;
}
function leituraBuggy(manual) {
  // js/manual.js:25 original — INSEGURO:
  if (!manual.passos.length) return "vazio";
  return manual.passos.length + " passos";
}

var casos = [
  { nome: "index sem descricao", fn: function () { return renderBuggy({ id: "2", titulo: "t", setor: "s", passos: [] }); } },
  { nome: "manual sem passos", fn: function () { return leituraBuggy({ id: "x", titulo: "t" }); } },
  { nome: "lista com item null (filtrar)", fn: function () {
      var lista = [null];
      return lista.filter(function (m) { return (m.titulo + " " + m.setor).toLowerCase().indexOf("q") !== -1; });
  } }
];

var falhas = 0;
casos.forEach(function (c) {
  try { c.fn(); console.log("PASS (inesperado): " + c.nome); }
  catch (e) { falhas++; console.log("THROW esperado [" + c.nome + "]: " + e.name + ": " + e.message); }
});
if (!falhas) { console.error("ERRO: nenhum caso reproduziu — repro falhou"); process.exit(1); }
console.log("OK: " + falhas + "/" + casos.length + " casos reproduziram TypeError");
