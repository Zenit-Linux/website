(function () {
  "use strict";

  var OWN_REPO_URL = "https://raw.githubusercontent.com/Zenit-Linux/zpm/main/custom/own-repository.json";

  var els = {
    search: document.getElementById("pkg-search"),
    filters: document.getElementById("pkg-filters"),
    status: document.getElementById("pkg-status"),
    grid: document.getElementById("pkg-grid"),
    empty: document.getElementById("pkg-empty"),
  };

  if (!els.grid) return; // ta strona nie ma przeglądarki pakietów (bezpieczne wyjście)

  var state = {
    tools: [],
    query: "",
    typeFilter: "all",
  };

  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function typeLabel(t) {
    // Wartości "type" w own-repository.json odpowiadają wprost nazwie
    // wariantu enuma OwnToolKind w zpmpkg/types.nim ($t.kind w ownrepo.nim
    // przy serializacji) -- "otkBinary" / "otkGit".
    if (t === "otkBinary") return "binarka";
    if (t === "otkGit") return "źródła (git)";
    return t || "?";
  }

  function installCmd(tool) {
    return "zpm install " + tool.name + " -> own";
  }

  function render() {
    var q = state.query.trim().toLowerCase();
    var filtered = state.tools.filter(function (t) {
      if (state.typeFilter !== "all" && t.type !== state.typeFilter) return false;
      if (!q) return true;
      return (
        (t.name || "").toLowerCase().indexOf(q) !== -1 ||
        (t.info || "").toLowerCase().indexOf(q) !== -1 ||
        (t.stage || "").toLowerCase().indexOf(q) !== -1
      );
    });

    els.grid.innerHTML = filtered
      .map(function (t) {
        var meta = [];
        if (t.lang) meta.push('<span>lang: ' + escapeHtml(t.lang) + "</span>");
        if (t.stage) meta.push('<span>stage: ' + escapeHtml(t.stage) + "</span>");
        var source = t.type === "otkGit" ? t.repo : t.bin;
        return (
          '<article class="pkg-card">' +
            '<div class="pkg-card__head">' +
              '<span class="pkg-card__name">' + escapeHtml(t.name) + "</span>" +
              '<span class="pkg-card__type">' + escapeHtml(typeLabel(t.type)) + "</span>" +
            "</div>" +
            '<p class="pkg-card__info">' + (t.info ? escapeHtml(t.info) : "Brak opisu w own-repository.json.") + "</p>" +
            (meta.length ? '<div class="pkg-card__meta">' + meta.join("") + "</div>" : "") +
            '<code class="pkg-card__cmd">' + escapeHtml(installCmd(t)) + "</code>" +
            (source ? '<a class="tool-card__link" href="' + escapeHtml(source) + '" target="_blank" rel="noopener">źródło &rarr;</a>' : "") +
          "</article>"
        );
      })
      .join("");

    els.empty.hidden = filtered.length !== 0;
    els.status.textContent =
      state.tools.length === 0
        ? els.status.textContent // błąd/loading -- nie nadpisuj
        : filtered.length + " / " + state.tools.length + " pakiet(ów)" + (q ? ' dla "' + q + '"' : "");
  }

  function setStatusError(err) {
    els.status.innerHTML =
      'Nie udało się pobrać own-repository.json (' + escapeHtml(String(err)) + '). ' +
      'Możesz zobaczyć plik bezpośrednio na ' +
      '<a href="' + OWN_REPO_URL + '" target="_blank" rel="noopener">GitHubie</a>.';
  }

  function loadPackages() {
    fetch(OWN_REPO_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var tools = Array.isArray(data && data.tools) ? data.tools : [];
        state.tools = tools;
        if (tools.length === 0) {
          els.status.textContent = "own-repository.json jest puste (brak pakietów) albo ma nieoczekiwany kształt.";
          return;
        }
        render();
      })
      .catch(function (err) {
        setStatusError(err && err.message ? err.message : err);
      });
  }

  els.search.addEventListener("input", function () {
    state.query = els.search.value;
    render();
  });

  els.filters.addEventListener("click", function (ev) {
    var btn = ev.target.closest(".pkg-filter");
    if (!btn) return;
    state.typeFilter = btn.getAttribute("data-filter");
    Array.prototype.forEach.call(els.filters.querySelectorAll(".pkg-filter"), function (b) {
      b.setAttribute("aria-pressed", b === btn ? "true" : "false");
    });
    render();
  });

  loadPackages();
})();
