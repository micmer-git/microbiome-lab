(function () {
  "use strict";

  const { FOODS, GUILDS, simulate, dominantPathway } = window.MicrobiomeModel;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const EVIDENCE = [
    { year: 2021, type: "intervention", authors: "Wastyk et al. · Cell", title: "Gut-microbiota-targeted diets modulate human immune status", finding: "17-week randomized study: fermented-food and high-fibre arms produced distinct, person-variable microbiome and immune responses.", url: "https://doi.org/10.1016/j.cell.2021.06.019" },
    { year: 2019, type: "longitudinal", authors: "Johnson et al. · Cell Host & Microbe", title: "Daily sampling reveals personalized diet–microbiome associations", finding: "Dense food and stool sampling showed reproducible, highly individualized microbial responses to food choices.", url: "https://doi.org/10.1016/j.chom.2019.05.005" },
    { year: 2021, type: "cohort", authors: "Asnicar et al. · Nature Medicine · ZOE PREDICT 1", title: "Microbiome connections with host metabolism and habitual diet", finding: "Shotgun metagenomics in 1,098 deeply phenotyped people linked microbial species with foods, dietary patterns and cardiometabolic markers.", url: "https://doi.org/10.1038/s41591-020-01183-8" },
    { year: 2024, type: "intervention", authors: "Bermingham et al. · Nature Medicine · ZOE", title: "Effects of a personalized nutrition program on cardiometabolic health", finding: "An 18-week randomized trial tested advice incorporating food, postprandial responses, microbiome and health history.", url: "https://doi.org/10.1038/s41591-024-02951-6" },
    { year: 2019, type: "intervention", authors: "Baxter et al. · mBio", title: "Microbiota and SCFA dynamics after three fermentable fibres", finding: "174 adults showed substrate-specific and baseline-dependent responses to resistant starch and inulin-type fibre.", url: "https://doi.org/10.1128/mBio.02566-18" },
    { year: 2018, type: "intervention", authors: "Healey et al. · British Journal of Nutrition", title: "Habitual fibre intake influences response to an inulin prebiotic", finding: "A randomized crossover study found that habitual diet helped explain between-person differences in microbiota response.", url: "https://doi.org/10.1017/S0007114517003440" },
    { year: 2014, type: "intervention", authors: "David et al. · Nature", title: "Diet rapidly and reproducibly alters the human gut microbiome", finding: "Short animal- versus plant-based diets changed community structure and microbial gene expression within days.", url: "https://doi.org/10.1038/nature12820" },
    { year: 2015, type: "personalized", authors: "Zeevi et al. · Cell", title: "Personalized nutrition by prediction of glycemic responses", finding: "Continuous glucose monitoring, diet and microbiome features captured large interpersonal variation in post-meal responses.", url: "https://doi.org/10.1016/j.cell.2015.11.001" },
    { year: 2022, type: "intervention", authors: "Suez et al. · Cell", title: "Personalized microbiome-driven effects of non-nutritive sweeteners", finding: "Randomized exposure produced sweetener-specific, person-specific microbiome changes and glycemic effects.", url: "https://doi.org/10.1016/j.cell.2022.07.016" },
    { year: 2025, type: "cohort", authors: "Fackelmann et al. · Nature Microbiology", title: "Gut microbiome signatures of vegan, vegetarian and omnivore diets", finding: "Multi-cohort metagenomics linked diet patterns to species signatures; healthy plant-food quality cut across diet labels.", url: "https://doi.org/10.1038/s41564-024-01870-z" },
    { year: 2024, type: "cohort", authors: "Manghi et al. · Nature Microbiology · ZOE", title: "Coffee consumption and Lawsonibacter asaccharolyticus", finding: "Across >22,000 samples, coffee showed a strong, replicated association with one species, supported by culture experiments.", url: "https://doi.org/10.1038/s41564-024-01858-9" },
    { year: 2016, type: "cohort", authors: "De Filippis et al. · Gut", title: "Mediterranean diet adherence, microbiota and metabolome", finding: "Diet adherence, plant-food intake, SCFAs and microbial features were associated in habitual-diet observations.", url: "https://doi.org/10.1136/gutjnl-2015-309957" }
  ];

  const CATEGORY_LABELS = { all: "All", grains: "Grains", legumes: "Legumes", fruit: "Fruit", plants: "Plants", fermented: "Fermented", polyphenols: "Polyphenols", animal: "Animal", other: "Other" };
  const state = {
    selection: {},
    baseline: "typical",
    day: 28,
    foodFilter: "all",
    evidenceFilter: "all",
    query: "",
    result: null
  };

  function loadState() {
    try {
      const saved = JSON.parse(localStorage.getItem("microbiome-scenario-v1"));
      if (saved && saved.selection && saved.baseline) {
        state.selection = saved.selection;
        state.baseline = saved.baseline;
      }
    } catch (_) { /* A scenario is optional. */ }
  }

  function saveState() {
    try {
      localStorage.setItem("microbiome-scenario-v1", JSON.stringify({ selection: state.selection, baseline: state.baseline }));
    } catch (_) { /* The model still works when browser storage is unavailable. */ }
  }

  function renderFilters() {
    const categories = ["all", "grains", "legumes", "fruit", "plants", "fermented", "polyphenols", "animal", "other"];
    $("#food-filters").innerHTML = categories.map(category => `<button type="button" class="filter-button ${state.foodFilter === category ? "active" : ""}" data-food-filter="${category}">${CATEGORY_LABELS[category] || "Plants"}</button>`).join("");
    $("#evidence-filters").innerHTML = ["all", "intervention", "longitudinal", "cohort", "personalized"].map(type => `<button type="button" class="filter-button ${state.evidenceFilter === type ? "active" : ""}" data-evidence-filter="${type}">${type}</button>`).join("");
  }

  function renderFoodLibrary() {
    const query = state.query.trim().toLowerCase();
    const matches = FOODS.filter(food => {
      const categoryMatch = state.foodFilter === "all" || food.group === state.foodFilter || (state.foodFilter === "plants" && ["vegetables", "starches", "nuts", "fats"].includes(food.group));
      const searchMatch = !query || `${food.name} ${food.tags}`.toLowerCase().includes(query);
      return categoryMatch && searchMatch;
    });
    $("#food-library").innerHTML = matches.length ? matches.map(food => {
      const selected = state.selection[food.id] > 0;
      return `<button type="button" class="food-card ${selected ? "selected" : ""}" data-food="${food.id}" aria-label="Add ${food.name}">
        <span class="food-add">${selected ? state.selection[food.id] : "+"}</span><span class="food-icon" aria-hidden="true">${food.icon}</span><strong>${food.name}</strong><small>${food.tags}</small>
      </button>`;
    }).join("") : `<div class="empty-diet">No food matches. Try a substrate such as fibre or polyphenols.</div>`;
  }

  function renderSelectedDiet() {
    const foods = state.result.diet.foods;
    $("#plant-count").textContent = state.result.diet.plantCount;
    $("#diet-summary").textContent = foods.length ? `${foods.length} foods · ${Math.round(state.result.diet.totalServings)} servings / week` : "No foods added yet";
    $("#selected-list").innerHTML = foods.length ? foods.map(food => `<div class="selected-chip">
      <span>${food.icon} ${food.name}</span><button type="button" data-decrease="${food.id}" aria-label="Remove one weekly serving of ${food.name}">−</button><strong>${food.weekly}×</strong><button type="button" data-increase="${food.id}" aria-label="Add one weekly serving of ${food.name}">+</button>
    </div>`).join("") : `<div class="empty-diet">Select foods above to build a recurring dietary pattern.</div>`;
  }

  function renderEvidence() {
    const papers = EVIDENCE.filter(paper => state.evidenceFilter === "all" || paper.type === state.evidenceFilter);
    $("#evidence-list").innerHTML = papers.map(paper => `<a class="paper-row" href="${paper.url}" target="_blank" rel="noreferrer">
      <span class="paper-year">${paper.year}</span><span class="paper-title"><strong>${paper.title}</strong><small>${paper.authors}</small></span><span class="paper-finding">${paper.finding}</span><span class="paper-kind">${paper.type}</span><span class="paper-link">↗</span>
    </a>`).join("");
  }

  function renderGuilds(point, baselineGuilds) {
    $("#guild-grid").innerHTML = Object.entries(GUILDS).map(([id, guild]) => {
      const value = 100 * point.guilds[id];
      const delta = value - 100 * baselineGuilds[id];
      const direction = delta > .05 ? "up" : delta < -.05 ? "down" : "";
      const deltaCopy = Math.abs(delta) < .05 ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} pp`;
      return `<article class="guild-card"><header><i class="guild-dot" style="background:${guild.color}"></i><span class="guild-delta ${direction}">${deltaCopy}</span></header><strong>${value.toFixed(1)}<small>%</small></strong><p>${guild.name}<br>${guild.note}</p></article>`;
    }).join("");
  }

  function linePath(points, key, maxY, width, height, pad) {
    return points.map((point, index) => {
      const x = pad.l + (point.day / 28) * (width - pad.l - pad.r);
      const y = pad.t + (1 - point.guilds[key] / maxY) * (height - pad.t - pad.b);
      return `${index ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ");
  }

  function renderChart() {
    const svg = $("#trajectory-chart");
    const width = 720, height = 280, pad = { l: 38, r: 15, t: 18, b: 27 }, maxY = .35;
    const keys = ["butyrate", "bifido", "saccharolytic", "proteolytic"];
    const yTicks = [0, .1, .2, .3];
    const xTicks = [0, 7, 14, 21, 28];
    const markerX = pad.l + (state.day / 28) * (width - pad.l - pad.r);
    const grid = yTicks.map(tick => {
      const y = pad.t + (1 - tick / maxY) * (height - pad.t - pad.b);
      return `<line x1="${pad.l}" y1="${y}" x2="${width - pad.r}" y2="${y}" stroke="rgba(244,239,229,.10)"/><text x="2" y="${y + 3}">${Math.round(tick * 100)}%</text>`;
    }).join("") + xTicks.map(tick => {
      const x = pad.l + (tick / 28) * (width - pad.l - pad.r);
      return `<text x="${x}" y="${height - 5}" text-anchor="middle">D${tick}</text>`;
    }).join("");
    const paths = keys.map(key => `<path d="${linePath(state.result.trajectory, key, maxY, width, height, pad)}" fill="none" stroke="${GUILDS[key].color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
    svg.innerHTML = `${grid}<line x1="${markerX}" y1="${pad.t}" x2="${markerX}" y2="${height - pad.b}" stroke="rgba(244,239,229,.42)" stroke-dasharray="3 5"/>${paths}`;
    $("#chart-legend").innerHTML = keys.map(key => `<span><i style="background:${GUILDS[key].color}"></i>${GUILDS[key].name.replace(" producers", "")}</span>`).join("");
  }

  function capacityCopy(score, delta) {
    if (delta > 5) return "Broader substrate supply supports more carbohydrate-fermenting capacity in this scenario.";
    if (delta < -5) return "Low fermentable substrate or higher protein-and-bile pressure narrows modelled capacity.";
    if (score >= 70) return "A comparatively broad, resilient functional ecology in this model.";
    return "A balanced starting point with room to widen substrate diversity.";
  }

  function renderPathway() {
    const pathway = dominantPathway(state.result.diet);
    $("#pathway-title").textContent = pathway.title;
    $("#pathway-copy").textContent = pathway.copy;
    $("#confidence-label").textContent = ["Very low", "Low", "Moderate", "High", "High"][pathway.confidence];
    $$("#confidence-dots i").forEach((dot, index) => dot.classList.toggle("filled", index < pathway.confidence));
    $("#pathway-visual").innerHTML = pathway.nodes.map(([title, subtitle]) => `<div class="path-node"><span>${title}<small>${subtitle}</small></span></div>`).join("");
  }

  function renderSimulation() {
    state.result = simulate(state.selection, state.baseline, 28);
    const point = state.result.trajectory[state.day];
    const baselinePoint = state.result.trajectory[0];
    const delta = point.capacity - baselinePoint.capacity;
    $("#day-label").textContent = state.day;
    $("#capacity-score").textContent = point.capacity;
    $("#hero-diversity").textContent = point.capacity;
    $("#capacity-ring").style.setProperty("--score", point.capacity);
    $("#capacity-copy").textContent = capacityCopy(point.capacity, delta);
    const deltaElement = $("#capacity-delta");
    deltaElement.textContent = delta === 0 ? "baseline" : `${delta > 0 ? "+" : ""}${delta} vs baseline`;
    deltaElement.className = `delta-pill ${delta > 0 ? "positive" : delta < 0 ? "negative" : "neutral"}`;
    $("#butyrate-potential").textContent = point.metabolites.butyratePotential;
    $("#butyrate-meter").style.width = `${point.metabolites.butyratePotential}%`;
    $("#acetate-share").textContent = `${point.metabolites.acetateShare}%`;
    $("#propionate-share").textContent = `${point.metabolites.propionateShare}%`;
    $("#proteolytic-pressure").textContent = point.metabolites.proteolyticPressure;
    renderGuilds(point, baselinePoint.guilds);
    renderChart();
    renderSelectedDiet();
    renderPathway();
    updateParticleTargets(point.guilds);
    saveState();
  }

  function addFood(id, amount = 1) {
    state.selection[id] = Math.max(0, Math.min(21, (state.selection[id] || 0) + amount));
    if (!state.selection[id]) delete state.selection[id];
    renderFoodLibrary();
    renderSimulation();
  }

  const particles = [];
  let particleGuilds = {};
  let animationFrame;

  function initCanvas() {
    const canvas = $("#ecosystem-canvas");
    for (let index = 0; index < 82; index += 1) {
      const angle = index * 2.39996;
      const radius = 70 + (index % 23) * 8.5;
      particles.push({ angle, radius, speed: .00008 + (index % 7) * .000012, size: 3.5 + (index % 5) * 2.2, phase: index * .83, guild: "generalists" });
    }
    function draw(time) {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const targetWidth = Math.max(1, Math.floor(rect.width * dpr));
      if (canvas.width !== targetWidth) { canvas.width = targetWidth; canvas.height = Math.floor(rect.height * dpr); }
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scale = canvas.width / 680;
      const center = canvas.width / 2;
      const gradient = ctx.createRadialGradient(center, center, 15 * scale, center, center, 285 * scale);
      gradient.addColorStop(0, "rgba(131,213,192,.18)"); gradient.addColorStop(.55, "rgba(157,147,232,.06)"); gradient.addColorStop(1, "rgba(244,239,229,0)");
      ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(center, center, 290 * scale, 0, Math.PI * 2); ctx.fill();
      particles.forEach((particle, index) => {
        const wobble = Math.sin(time * .00035 + particle.phase) * 12;
        const angle = particle.angle + time * particle.speed * (index % 2 ? 1 : -1);
        const radius = (particle.radius + wobble) * scale;
        const x = center + Math.cos(angle) * radius * 1.07;
        const y = center + Math.sin(angle) * radius * .92;
        ctx.save(); ctx.translate(x, y); ctx.rotate(angle + time * .00008);
        ctx.globalAlpha = .55 + .3 * Math.sin(time * .0007 + particle.phase);
        ctx.fillStyle = GUILDS[particle.guild].color;
        if (index % 4 === 0) {
          ctx.beginPath(); ctx.roundRect(-particle.size * scale, -particle.size * .38 * scale, particle.size * 2 * scale, particle.size * .76 * scale, 8 * scale); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(0, 0, particle.size * .55 * scale, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      });
      animationFrame = requestAnimationFrame(draw);
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) draw(0); else animationFrame = requestAnimationFrame(draw);
  }

  function updateParticleTargets(guilds) {
    particleGuilds = guilds;
    const cumulative = [];
    let total = 0;
    Object.keys(GUILDS).forEach(key => { total += particleGuilds[key]; cumulative.push([key, total]); });
    particles.forEach((particle, index) => {
      const position = (index + .5) / particles.length;
      particle.guild = (cumulative.find(([, threshold]) => position <= threshold) || ["generalists"])[0];
    });
  }

  function bindEvents() {
    $("#food-filters").addEventListener("click", event => {
      const button = event.target.closest("[data-food-filter]"); if (!button) return;
      state.foodFilter = button.dataset.foodFilter; renderFilters(); renderFoodLibrary();
    });
    $("#food-library").addEventListener("click", event => { const card = event.target.closest("[data-food]"); if (card) addFood(card.dataset.food, 1); });
    $("#selected-list").addEventListener("click", event => {
      const increase = event.target.closest("[data-increase]"); const decrease = event.target.closest("[data-decrease]");
      if (increase) addFood(increase.dataset.increase, 1); if (decrease) addFood(decrease.dataset.decrease, -1);
    });
    $("#food-search").addEventListener("input", event => { state.query = event.target.value; renderFoodLibrary(); });
    $("#baseline-options").addEventListener("click", event => {
      const button = event.target.closest("[data-baseline]"); if (!button) return;
      state.baseline = button.dataset.baseline;
      $$("[data-baseline]").forEach(item => { const active = item === button; item.classList.toggle("active", active); item.setAttribute("aria-checked", active); });
      renderSimulation();
    });
    $("#day-slider").addEventListener("input", event => { state.day = Number(event.target.value); renderSimulation(); });
    $("#clear-foods").addEventListener("click", () => { state.selection = {}; renderFoodLibrary(); renderSimulation(); });
    $("#reset-button").addEventListener("click", () => { state.selection = {}; state.baseline = "typical"; state.day = 28; $("#day-slider").value = 28; $$("[data-baseline]").forEach(item => { const active = item.dataset.baseline === "typical"; item.classList.toggle("active", active); item.setAttribute("aria-checked", active); }); renderFoodLibrary(); renderSimulation(); });
    $("#load-demo").addEventListener("click", () => { state.selection = { oats: 7, lentils: 4, berries: 5, "onion-garlic": 5, wholegrain: 7, almonds: 5, cocoa: 4, coffee: 7, broccoli: 4, kefir: 4, "olive-oil": 7, apple: 5 }; state.baseline = "typical"; renderFoodLibrary(); renderSimulation(); $("#model").scrollIntoView({ behavior: "smooth" }); });
    $("#evidence-filters").addEventListener("click", event => { const button = event.target.closest("[data-evidence-filter]"); if (!button) return; state.evidenceFilter = button.dataset.evidenceFilter; renderFilters(); renderEvidence(); });
    const dialog = $("#about-dialog");
    $("#about-button").addEventListener("click", () => dialog.showModal());
    $("#dialog-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
    window.addEventListener("beforeunload", () => { if (animationFrame) cancelAnimationFrame(animationFrame); });
  }

  loadState();
  renderFilters();
  renderFoodLibrary();
  renderEvidence();
  initCanvas();
  $$("[data-baseline]").forEach(item => { const active = item.dataset.baseline === state.baseline; item.classList.toggle("active", active); item.setAttribute("aria-checked", active); });
  renderSimulation();
  bindEvents();
})();
