// v2 — reprodução fiel após investigação Phase 1
// Conclusao: index.js:47 com descricao undefined NÃO quebra sozinho por short-circuit
// (desc="" falsy -> ternary não avalia m.descricao.length). É debt/latente, não causa ativa.
// Causas ativas reais: item null na lista + manual.passos undefined.
function renderBuggy(m) {
  var desc = (m.descricao || "").slice(0, 90);
  return (desc ? '<div>' + desc + (m.descricao.length > 90 ? "…" : "") + "</div>" : "");
}
function renderFixed(m) {
  if (!m) return "";
  var d = String(m.descricao == null ? "" : m.descricao).slice(0, 90);
  var total = String(m.descricao == null ? "" : m.descricao).length;
  return (d ? '<div>' + d + (total > 90 ? "…" : "") + "</div>" : "");
}
function leituraBuggy(manual) {
  if (!manual.passos.length) return "vazio"; // THROW se passos undefined
  return "ok";
}
function leituraFixed(manual) {
  if (!((manual.passos || []).length)) return "vazio";
  return "ok";
}
function filtrarBuggy(lista, q) {
  return lista.filter(function (m) {
    if (q && (m.titulo + " " + m.setor).toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}
function filtrarFixed(lista, q) {
  return lista.filter(function (m) {
    if (!m) return false;
    var t = String(m.titulo == null ? "" : m.titulo) + " " + String(m.setor == null ? "" : m.setor);
    if (q && t.toLowerCase().indexOf(q) === -1) return false;
    return true;
  });
}

// --- evidência ---
var out = [];
function caso(nome, fnBuggy, fnFixed, input) {
  var bugThrow = null, fixOk = null;
  try { fnBuggy(input); } catch (e) { bugThrow = e.name + ": " + e.message; }
  try { fixOk = JSON.stringify(fnFixed(input)); } catch (e) { fixOk = "FIX-THROW " + e.message; }
  out.push(nome + " | buggy=" + (bugThrow ? "THROW " + bugThrow : "OK") + " | fixed=" + fixOk);
}

caso("A:index descricao undefined", renderBuggy, renderFixed, { descricao: undefined });
caso("B:index item null", renderBuggy, renderFixed, null);
caso("C:manual passos undefined", leituraBuggy, leituraFixed, { id: "x" });
caso("D:filtrar lista com null", function (l) { return filtrarBuggy(l, "q"); }, function (l) { return filtrarFixed(l, "q"); }, [null, { titulo: "Nota", setor: "FISCAL" }]);
console.log(out.join("\n"));
