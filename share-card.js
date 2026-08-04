(() => {
  "use strict";

  const $ = selector => document.querySelector(selector);
  const canvas = $("#share-story-canvas");
  const dialog = $("#share-dialog");
  if (!canvas || !dialog) return;

  const ctx = canvas.getContext("2d");
  const palette = { deep: "#122b26", paper: "#f4efe5", acid: "#dfff73", aqua: "#67dfd2", coral: "#ff8f73", muted: "#9eb1aa", line: "#36534b" };
  const copy = {
    en: {
      open: "Share my microbiome story", kicker: "Story-ready result", title: "Your ecosystem, ready to share.",
      intro: "A 1080 × 1920 illustration of all 20 modelled species. Share it to Instagram Stories or save it to your phone.",
      share: "Share image", download: "Download PNG", heading: "MY MODELLED\nGUT ECOSYSTEM", baseline: "MY FOOD-FREQUENCY BASELINE",
      exposure: "TESTED EXPOSURE", legendStart: "usual week", legendEnd: "after 10×", boundary: "Educational model · not a stool test or medical prediction",
      saved: "PNG saved — ready for Instagram Stories.", failed: "Sharing is unavailable here. The PNG has been downloaded instead."
    },
    it: {
      open: "Condividi il mio microbioma", kicker: "Risultato pronto per le Stories", title: "Il tuo ecosistema, pronto da condividere.",
      intro: "Un’illustrazione 1080 × 1920 con tutte le 20 specie modellate. Condividila nelle Stories o salvala sul telefono.",
      share: "Condividi immagine", download: "Scarica PNG", heading: "IL MIO ECOSISTEMA\nINTESTINALE\nMODELLATO", baseline: "BASELINE DALLE MIE FREQUENZE",
      exposure: "ESPOSIZIONE PROVATA", legendStart: "settimana abituale", legendEnd: "dopo 10×", boundary: "Modello educativo · non è un test fecale né una previsione medica",
      saved: "PNG salvato — pronto per le Instagram Stories.", failed: "Condivisione non disponibile qui. Il PNG è stato scaricato."
    }
  };

  function language() { return document.documentElement.lang === "it" ? "it" : "en"; }
  function t(key) { return copy[language()][key]; }
  function roundRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath(); ctx.roundRect(x, y, w, h, r);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 2; ctx.stroke(); }
  }
  function fitText(text, maxWidth, initial) {
    let size = initial;
    do { ctx.font = `600 ${size}px Arial, sans-serif`; size -= 1; } while (ctx.measureText(text).width > maxWidth && size > 23);
    return size + 1;
  }
  function speciesData() {
    return [...document.querySelectorAll("#story-chart .story-species-node")].map((node, index) => {
      const name = node.querySelector(".species-name")?.textContent?.trim() || `Species ${index + 1}`;
      const deltaText = node.querySelector(".delta-label")?.textContent?.trim() || "0.00 pp";
      const delta = Number.parseFloat(deltaText.replace(",", ".")) || 0;
      const start = Number(node.querySelector(".start-dot")?.getAttribute("r")) || 8;
      const end = Number(node.querySelector(".ten-ring")?.getAttribute("r")) || start;
      return { name, delta, start, end };
    }).slice(0, 20);
  }
  function exposureName() {
    return $("#story-options .story-option.selected strong")?.textContent?.trim() || (language() === "it" ? "Scenario selezionato" : "Selected scenario");
  }
  function drawStory() {
    const species = speciesData();
    const exposure = exposureName();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = palette.deep; ctx.fillRect(0, 0, 1080, 1920);
    const glow = ctx.createRadialGradient(800, 180, 20, 800, 180, 700);
    glow.addColorStop(0, "rgba(103,223,210,.18)"); glow.addColorStop(1, "rgba(18,43,38,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 1080, 900);

    ctx.fillStyle = palette.acid; ctx.font = "600 27px Arial, sans-serif"; ctx.letterSpacing = "5px"; ctx.fillText("MICROBIOME LAB", 72, 96);
    ctx.fillStyle = palette.paper; ctx.font = "600 78px Arial, sans-serif";
    const headingLines = t("heading").split("\n");
    headingLines.forEach((line, index) => ctx.fillText(line, 72, 206 + index * 84));
    const baselineY = 240 + headingLines.length * 84;
    ctx.fillStyle = palette.muted; ctx.font = "400 27px Arial, sans-serif"; ctx.fillText(t("baseline"), 74, baselineY);

    roundRect(72, baselineY + 44, 936, 128, 34, "rgba(244,239,229,.07)", palette.line);
    ctx.fillStyle = palette.muted; ctx.font = "600 22px Arial, sans-serif"; ctx.fillText(t("exposure"), 108, baselineY + 88);
    ctx.fillStyle = palette.paper; ctx.font = `600 ${fitText(exposure, 820, 39)}px Arial, sans-serif`; ctx.fillText(exposure, 108, baselineY + 140);

    const cols = 4, startY = 708, colW = 234, rowH = 204;
    species.forEach((item, index) => {
      const col = index % cols, row = Math.floor(index / cols), x = 72 + col * colW + colW / 2, y = startY + row * rowH;
      const maxR = Math.max(item.start, item.end, 5);
      const startR = 18 + (item.start / maxR) * 25;
      const endR = 21 + (item.end / maxR) * 28;
      ctx.beginPath(); ctx.arc(x, y, endR, 0, Math.PI * 2); ctx.strokeStyle = item.delta >= 0 ? palette.acid : palette.coral; ctx.lineWidth = 7; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, startR, 0, Math.PI * 2); ctx.fillStyle = "rgba(244,239,229,.18)"; ctx.fill(); ctx.strokeStyle = palette.paper; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(x - 10, y - 12, 5, 0, Math.PI * 2); ctx.fillStyle = "rgba(244,239,229,.72)"; ctx.fill();
      ctx.fillStyle = palette.paper; ctx.textAlign = "center"; ctx.font = "italic 600 22px Georgia, serif";
      const short = item.name.length > 19 ? `${item.name.slice(0, 18)}…` : item.name; ctx.fillText(short, x, y + 68);
      ctx.fillStyle = item.delta >= 0 ? palette.acid : palette.coral; ctx.font = "600 20px Arial, sans-serif"; ctx.fillText(`${item.delta >= 0 ? "+" : ""}${item.delta.toFixed(2)} pp`, x, y + 98);
    });
    ctx.textAlign = "left";
    const footerY = 1745;
    ctx.beginPath(); ctx.moveTo(72, footerY); ctx.lineTo(1008, footerY); ctx.strokeStyle = palette.line; ctx.lineWidth = 2; ctx.stroke();
    [[palette.paper, t("legendStart")], [palette.acid, t("legendEnd")]].forEach(([color, label], index) => {
      const x = 76 + index * 330; ctx.beginPath(); ctx.arc(x, 1800, 10, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      ctx.fillStyle = palette.paper; ctx.font = "400 23px Arial, sans-serif"; ctx.fillText(label, x + 22, 1808);
    });
    ctx.fillStyle = palette.muted; ctx.font = "400 20px Arial, sans-serif"; ctx.fillText(t("boundary"), 72, 1870);
    ctx.textAlign = "right"; ctx.fillStyle = palette.paper; ctx.font = "600 20px Arial, sans-serif"; ctx.fillText("microbiome-lab", 1008, 1870); ctx.textAlign = "left";
  }
  function syncCopy() {
    $("#story-share-button").textContent = t("open"); $("#share-dialog-kicker").textContent = t("kicker");
    $("#share-dialog-title").textContent = t("title"); $("#share-dialog-intro").textContent = t("intro");
    $("#share-native-button").textContent = t("share"); $("#share-download-button").textContent = t("download");
  }
  function makeBlob() { return new Promise(resolve => canvas.toBlob(resolve, "image/png", 1)); }
  async function download() {
    drawStory(); const blob = await makeBlob(); if (!blob) return;
    const url = URL.createObjectURL(blob), anchor = document.createElement("a");
    anchor.href = url; anchor.download = "my-microbiome-story.png"; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("#share-status").textContent = t("saved");
  }
  async function share() {
    drawStory(); const blob = await makeBlob(); if (!blob) return;
    const file = new File([blob], "my-microbiome-story.png", { type: "image/png" });
    if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
      try { await navigator.share({ files: [file], title: "Microbiome Lab" }); return; } catch (error) { if (error.name === "AbortError") return; }
    }
    $("#share-status").textContent = t("failed"); await download();
  }

  $("#story-share-button").addEventListener("click", () => { syncCopy(); drawStory(); $("#share-status").textContent = ""; dialog.showModal(); });
  $("#share-dialog-close").addEventListener("click", () => dialog.close());
  $("#share-native-button").addEventListener("click", share);
  $("#share-download-button").addEventListener("click", download);
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  new MutationObserver(syncCopy).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  syncCopy();
})();
