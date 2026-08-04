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
      const startShare = Number(node.dataset.start) || 0;
      const endShare = Number(node.dataset.end) || startShare;
      const color = node.querySelector(".start-dot")?.getAttribute("fill") || palette.paper;
      return { name, delta, start, end, startShare, endShare, color, guild: node.dataset.guild || "generalists", driverIcon: node.dataset.driverIcon || "🍽" };
    }).slice(0, 20);
  }
  function exposureName() {
    return $("#story-options .story-option.selected strong")?.textContent?.trim() || (language() === "it" ? "Scenario selezionato" : "Selected scenario");
  }
  function wrapText(text, x, y, maxWidth, lineHeight, maxLines = 3) {
    const words = text.split(/\s+/); let line = "", lineIndex = 0;
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > maxWidth && line) {
        ctx.fillText(line, x, y + lineIndex * lineHeight); line = word; lineIndex += 1;
        if (lineIndex >= maxLines - 1) break;
      } else line = next;
    }
    if (lineIndex < maxLines) ctx.fillText(line, x, y + lineIndex * lineHeight);
  }
  function profileFor(species) {
    const guilds = {};
    species.forEach(item => { guilds[item.guild] = (guilds[item.guild] || 0) + item.endShare; });
    if ((guilds.bile || 0) + (guilds.proteolytic || 0) >= .18) return language() === "it"
      ? ["Profilo tollerante a bile e proteine", "Più spazio modellato in nicchie legate a bile e substrati proteici; non è un'etichetta di microbioma cattivo."]
      : ["Bile- and protein-tolerant profile", "More modeled space in bile- and protein-linked niches; this is not a bad-microbiome label."];
    if ((guilds.butyrate || 0) + (guilds.bifido || 0) >= .43) return language() === "it"
      ? ["Profilo di cross-feeding fermentativo", "Prevalgono reti modellate che condividono substrati e sostengono la produzione di SCFA."]
      : ["Fermentative cross-feeding profile", "Modeled networks that share substrates and support SCFA production carry more weight."];
    if ((guilds.saccharolytic || 0) >= .27) return language() === "it"
      ? ["Profilo degradatore di carboidrati complessi", "Hanno più peso le specie che aprono amidi, pectine e altri glicani alla comunità."]
      : ["Complex-carbohydrate degrader profile", "Species that open starches, pectins and other glycans to the community carry more weight."];
    return language() === "it"
      ? ["Profilo ecologico misto", "Nessun gruppo funzionale domina nettamente questa distribuzione modellata."]
      : ["Mixed ecological profile", "No functional guild clearly dominates this modeled distribution."];
  }
  function drawStory() {
    const species = speciesData();
    const exposure = exposureName();
    const variety = species.filter(item => item.endShare >= .02).length;
    const [profileTitle, profileCopy] = profileFor(species);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = palette.deep; ctx.fillRect(0, 0, 1080, 1920);
    const glow = ctx.createRadialGradient(540, 1050, 80, 540, 1050, 560);
    glow.addColorStop(0, "rgba(103,223,210,.18)"); glow.addColorStop(.58, "rgba(157,147,232,.07)"); glow.addColorStop(1, "rgba(18,43,38,0)");
    ctx.fillStyle = glow; ctx.fillRect(0, 420, 1080, 1160);

    ctx.fillStyle = palette.acid; ctx.font = "600 27px Arial, sans-serif"; ctx.letterSpacing = "5px"; ctx.fillText("MICROBIOME LAB", 72, 96);
    ctx.fillStyle = palette.paper; ctx.font = "600 67px Arial, sans-serif"; ctx.fillText(language() === "it" ? "IL MIO ECOSISTEMA" : "MY GUT ECOSYSTEM", 72, 190);
    ctx.fillText(language() === "it" ? "INTESTINALE MODELLATO" : "— MODELLED", 72, 263);
    ctx.fillStyle = palette.aqua; ctx.font = "600 28px Arial, sans-serif"; ctx.fillText(profileTitle.toUpperCase(), 72, 336);
    ctx.fillStyle = palette.muted; ctx.font = "400 24px Arial, sans-serif"; wrapText(profileCopy, 72, 378, 880, 32, 2);

    roundRect(72, 462, 936, 104, 30, "rgba(244,239,229,.06)", palette.line);
    ctx.fillStyle = palette.muted; ctx.font = "600 19px Arial, sans-serif"; ctx.fillText(t("exposure"), 106, 500);
    ctx.fillStyle = palette.paper; ctx.font = `600 ${fitText(exposure, 820, 34)}px Arial, sans-serif`; ctx.fillText(exposure, 106, 544);

    const centerX = 540, centerY = 1110;
    [180, 300, 420].forEach((radius, index) => { ctx.beginPath(); ctx.arc(centerX, centerY, radius, 0, Math.PI * 2); ctx.strokeStyle = `rgba(244,239,229,${.13 - index * .025})`; ctx.lineWidth = 2; ctx.setLineDash([7, 13]); ctx.stroke(); });
    ctx.setLineDash([]);
    roundRect(centerX - 150, centerY - 116, 300, 232, 90, "rgba(18,43,38,.92)", palette.aqua);
    ctx.textAlign = "center"; ctx.fillStyle = palette.muted; ctx.font = "600 18px Arial, sans-serif"; ctx.fillText(language() === "it" ? "VARIETÀ MODELLATA" : "MODELLED VARIETY", centerX, centerY - 54);
    ctx.fillStyle = palette.paper; ctx.font = "600 72px Arial, sans-serif"; ctx.fillText(`${variety}/20`, centerX, centerY + 24);
    ctx.fillStyle = palette.aqua; ctx.font = "600 18px Arial, sans-serif"; ctx.fillText(language() === "it" ? "SPECIE ≥ 2%" : "SPECIES ≥ 2%", centerX, centerY + 67);

    species.forEach((item, index) => {
      const inner = index < 8, ringIndex = inner ? index : index - 8, count = inner ? 8 : 12;
      const radius = inner ? 270 : 430, angle = -Math.PI / 2 + ringIndex * (Math.PI * 2 / count) + (inner ? 0 : Math.PI / 12);
      const x = centerX + Math.cos(angle) * radius, y = centerY + Math.sin(angle) * radius;
      const nodeR = 17 + 30 * Math.sqrt(Math.max(item.endShare, .002) / .15);
      ctx.beginPath(); ctx.moveTo(centerX + Math.cos(angle) * 155, centerY + Math.sin(angle) * 155); ctx.lineTo(x, y); ctx.strokeStyle = "rgba(244,239,229,.08)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, nodeR + 7, 0, Math.PI * 2); ctx.strokeStyle = item.delta >= 0 ? palette.acid : palette.coral; ctx.lineWidth = 6; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, Math.max(10, nodeR - 5), 0, Math.PI * 2); ctx.fillStyle = item.color; ctx.globalAlpha = .78; ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = palette.paper; ctx.font = "600 18px Arial, sans-serif"; ctx.fillText(item.driverIcon, x + nodeR - 2, y - nodeR + 5);
      ctx.font = "italic 600 17px Georgia, serif"; const short = item.name.length > 14 ? `${item.name.slice(0, 13)}…` : item.name; ctx.fillText(short, x, y + nodeR + 27);
    });
    ctx.textAlign = "left";
    const footerY = 1645;
    ctx.beginPath(); ctx.moveTo(72, footerY); ctx.lineTo(1008, footerY); ctx.strokeStyle = palette.line; ctx.lineWidth = 2; ctx.stroke();
    [[palette.paper, t("legendStart")], [palette.acid, t("legendEnd")]].forEach(([color, label], index) => {
      const x = 76 + index * 330; ctx.beginPath(); ctx.arc(x, 1700, 10, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      ctx.fillStyle = palette.paper; ctx.font = "400 23px Arial, sans-serif"; ctx.fillText(label, x + 22, 1708);
    });
    ctx.fillStyle = palette.muted; ctx.font = "400 20px Arial, sans-serif"; wrapText(language() === "it" ? "Varietà = specie con quota modellata ≥2%. Soglia descrittiva, non biodiversità misurata." : "Variety = species with a modeled share ≥2%. Descriptive threshold, not measured biodiversity.", 72, 1775, 800, 27, 2);
    ctx.fillStyle = palette.muted; ctx.font = "400 19px Arial, sans-serif"; ctx.fillText(t("boundary"), 72, 1865);
    ctx.textAlign = "right"; ctx.fillStyle = palette.paper; ctx.font = "600 20px Arial, sans-serif"; ctx.fillText("microbiome-lab", 1008, 1865); ctx.textAlign = "left";
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
