(function () {
  "use strict";

  var body = document.getElementById("boot-terminal");
  if (!body) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var script = [
    { t: "prompt", text: "$ zlb build all --arch x86_64 --manifest distro.hcl" },
    { t: "line", text: "==> [x86_64] discovering modules" },
    { t: "line", text: "==> modules/core: 17 pakiet(ów) do zainstalowania" },
    { t: "stage", text: "==> stage0  bootstrap  (zpm, zlb same siebie budują)" },
    { t: "stage", text: "==> stage1  own        zpm, zpk, installer" },
    { t: "stage", text: "==> stage2  system     kernel, zsrv, zboot" },
    { t: "stage", text: "==> stage3  image      iso + oci" },
    { t: "line", text: "==> zpm own install kernel -> testing" },
    { t: "line", text: "[zpm:own] ✔ kernel @ release/testing zweryfikowany, zbudowany" },
    { t: "line", text: "==> zlb build iso --arch x86_64" },
    { t: "ok",   text: "✔ zenit-linux-0.3.0-x86_64.iso" },
    { t: "ok",   text: "✔ zenit-linux-0.3.0-x86_64.iso.sha256" },
    { t: "line", text: "" },
    { t: "prompt", text: "$ # ten obraz zawiera zlb, zpm i zpk —" },
    { t: "prompt", text: "$ # następny build Zenit uruchomi Zenit." }
  ];

  function classFor(type) {
    if (type === "prompt") return "prompt";
    if (type === "stage") return "stage";
    if (type === "ok") return "ok";
    return "";
  }

  function renderInstant() {
    script.forEach(function (entry) {
      var div = document.createElement("div");
      div.className = "line " + classFor(entry.t);
      div.textContent = entry.text || "\u00A0";
      body.appendChild(div);
    });
  }

  function typeLine(entry, onDone) {
    var div = document.createElement("div");
    div.className = "line " + classFor(entry.t);
    body.appendChild(div);

    var text = entry.text;
    if (text.length === 0) {
      div.innerHTML = "&nbsp;";
      return onDone();
    }

    var i = 0;
    var speed = entry.t === "prompt" ? 26 : 8;
    (function tick() {
      i += 1;
      div.textContent = text.slice(0, i);
      body.scrollTop = body.scrollHeight;
      if (i < text.length) {
        window.setTimeout(tick, speed);
      } else {
        onDone();
      }
    })();
  }

  function runSequence(index) {
    if (index >= script.length) {
      var cursor = document.createElement("span");
      cursor.className = "terminal__cursor";
      body.appendChild(cursor);
      return;
    }
    var delay = script[index].t === "stage" ? 260 : 90;
    window.setTimeout(function () {
      typeLine(script[index], function () { runSequence(index + 1); });
    }, delay);
  }

  if (reduceMotion) {
    renderInstant();
  } else {
    runSequence(0);
  }
})();
